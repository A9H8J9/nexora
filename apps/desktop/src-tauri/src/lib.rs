#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::{fs, path::PathBuf, process::Command};

use tauri::Manager;

/* =========================================================
   TYPES
========================================================= */

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Skill {
    pub id: String,
    pub name: String,
    pub source: String,
    pub slug: String,
    pub installs: u64,
    pub url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InstalledSkill {
    pub id: String,
    pub name: String,
    pub source: String,
    pub slug: String,
    pub path: String,
    pub enabled: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CommandResult {
    pub success: bool,
    pub stdout: String,
    pub stderr: String,
    pub code: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AuditResult {
    pub id: String,
    pub source: String,
    pub slug: String,
    pub audits: Vec<Audit>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Audit {
    pub provider: Option<String>,
    pub status: Option<String>,

    #[serde(rename = "riskLevel")]
    pub risk_level: Option<String>,

    pub summary: Option<String>,
}

/* =========================================================
   NEXORA METADATA ROOT
=========================================================

   IMPORTANT:

   This directory is ONLY for Nexora metadata.

   The actual Skill files are managed by the official
   Skills CLI.

========================================================= */

fn skills_root(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let root = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Could not resolve app data directory: {e}"))?
        .join("skills");

    fs::create_dir_all(&root)
        .map_err(|e| format!("Could not create skills metadata directory: {e}"))?;

    Ok(root)
}

/* =========================================================
   HOME DIRECTORY
========================================================= */

fn home_directory() -> Result<PathBuf, String> {
    if let Ok(user_profile) = std::env::var("USERPROFILE") {
        if !user_profile.trim().is_empty() {
            return Ok(PathBuf::from(user_profile));
        }
    }

    if let Ok(home) = std::env::var("HOME") {
        if !home.trim().is_empty() {
            return Ok(PathBuf::from(home));
        }
    }

    Err("Could not determine user home directory.".to_string())
}

/* =========================================================
   NORMALIZATION
========================================================= */

fn normalize_skill_id(id: &str) -> String {
    let id = id.trim();

    let id = id
        .strip_prefix("https://skills.sh/")
        .or_else(|| id.strip_prefix("http://skills.sh/"))
        .unwrap_or(id);

    id.trim_matches('/').trim().to_string()
}

fn skill_id_parts(id: &str) -> Result<(String, String, String), String> {
    let normalized = normalize_skill_id(id);

    /*
        Expected:

        owner/repository@skill
    */

    if let Some((source, slug)) = normalized.split_once('@') {
        let source = source.trim();
        let slug = slug.trim();

        if source.contains('/')
            && !source.contains("://")
            && !source.contains('<')
            && !source.contains('>')
            && !source.contains('"')
            && !slug.is_empty()
        {
            return Ok((
                format!("{source}@{slug}"),
                source.to_string(),
                slug.to_string(),
            ));
        }
    }

    /*
        Also support:

        owner/repository/skill
    */

    let parts: Vec<&str> = normalized
        .split('/')
        .filter(|part| !part.trim().is_empty())
        .collect();

    if parts.len() >= 3 {
        let source = format!("{}/{}", parts[0], parts[1]);
        let slug = parts[2..].join("/");

        if !source.contains("://")
            && !source.contains('<')
            && !source.contains('>')
            && !slug.is_empty()
        {
            return Ok((format!("{source}@{slug}"), source, slug));
        }
    }

    Err(format!(
        "Invalid skill ID: {id}. Expected owner/repository@skill"
    ))
}

/* =========================================================
   SKILLS PAGE
========================================================= */

fn skill_page_url(id: &str) -> Result<String, String> {
    let (_, source, slug) = skill_id_parts(id)?;

    Ok(format!("https://skills.sh/{source}/{slug}"))
}

/* =========================================================
   BUN
========================================================= */

fn run_bunx(args: &[&str]) -> Result<CommandResult, String> {
    match Command::new("bun").arg("x").args(args).output() {
        Ok(output) => {
            return Ok(CommandResult {
                success: output.status.success(),
                stdout: String::from_utf8_lossy(&output.stdout).to_string(),
                stderr: String::from_utf8_lossy(&output.stderr).to_string(),
                code: output.status.code(),
            });
        }

        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {}

        Err(error) => {
            return Err(format!("Failed to run Bun: {error}"));
        }
    }

    match Command::new("bunx")
        .args(args)
        .output()
    {
        Ok(output) => Ok(CommandResult {
            success: output.status.success(),
            stdout: String::from_utf8_lossy(
                &output.stdout,
            )
            .to_string(),
            stderr: String::from_utf8_lossy(
                &output.stderr,
            )
            .to_string(),
            code: output.status.code(),
        }),

        Err(error) => Err(format!(
            "Could not start Bun/Bunx. Make sure Bun is installed and available in PATH. Error: {error}"
        )),
    }
}

/* =========================================================
   COMMAND ERROR
========================================================= */

fn command_error(result: &CommandResult, fallback: &str) -> String {
    if !result.stderr.trim().is_empty() {
        result.stderr.trim().to_string()
    } else if !result.stdout.trim().is_empty() {
        result.stdout.trim().to_string()
    } else {
        fallback.to_string()
    }
}

/* =========================================================
   ANSI
========================================================= */

fn strip_ansi_codes(input: &str) -> String {
    let mut result = String::with_capacity(input.len());

    let bytes = input.as_bytes();
    let mut i = 0;

    while i < bytes.len() {
        if bytes[i] == 0x1b {
            i += 1;

            if i < bytes.len() && bytes[i] == b'[' {
                i += 1;

                while i < bytes.len() {
                    let byte = bytes[i];

                    if (b'@'..=b'~').contains(&byte) {
                        i += 1;
                        break;
                    }

                    i += 1;
                }
            }

            continue;
        }

        result.push(bytes[i] as char);
        i += 1;
    }

    result
}

/* =========================================================
   TITLE
========================================================= */

fn title_from_slug(slug: &str) -> String {
    slug.split(['-', '_', '/'])
        .filter(|word| !word.trim().is_empty())
        .map(|word| {
            let mut chars = word.chars();

            match chars.next() {
                Some(first) => first.to_uppercase().collect::<String>() + chars.as_str(),

                None => String::new(),
            }
        })
        .collect::<Vec<_>>()
        .join(" ")
}

/* =========================================================
   INSTALL COUNT
========================================================= */

fn parse_installs_value(value: &str) -> u64 {
    let value = value.trim().to_lowercase();

    if value.is_empty() {
        return 0;
    }

    if let Some(number) = value.strip_suffix('k') {
        if let Ok(number) = number.parse::<f64>() {
            return (number * 1_000.0).round() as u64;
        }
    }

    if let Some(number) = value.strip_suffix('m') {
        if let Ok(number) = number.parse::<f64>() {
            return (number * 1_000_000.0).round() as u64;
        }
    }

    if let Some(number) = value.strip_suffix('b') {
        if let Ok(number) = number.parse::<f64>() {
            return (number * 1_000_000_000.0).round() as u64;
        }
    }

    value.replace(',', "").parse::<u64>().unwrap_or(0)
}

/* =========================================================
   VALID ID
========================================================= */

fn is_valid_skill_id(id: &str) -> bool {
    let id = id.trim();

    if id.is_empty()
        || id.contains("://")
        || id.contains('<')
        || id.contains('>')
        || id.contains('"')
        || id.contains('\'')
    {
        return false;
    }

    let Some((source, slug)) = id.split_once('@') else {
        return false;
    };

    let source_parts: Vec<&str> = source.split('/').collect();

    source_parts.len() >= 2
        && source_parts.iter().all(|part| !part.trim().is_empty())
        && !slug.trim().is_empty()
}

/* =========================================================
   SEARCH PARSER
========================================================= */

fn parse_skill_result_line(line: &str) -> Option<Skill> {
    let line = line.trim();

    if line.is_empty() {
        return None;
    }

    if !line.contains(" installs") {
        return None;
    }

    let before_installs = line.split_once(" installs").map(|(left, _)| left)?.trim();

    let mut parts = before_installs.split_whitespace();

    let id = parts.next()?.trim();

    if !is_valid_skill_id(id) {
        return None;
    }

    let installs_text = parts.next()?.trim();

    let (_, source, slug) = skill_id_parts(id).ok()?;

    let installs = parse_installs_value(installs_text);

    Some(Skill {
        id: id.to_string(),

        name: title_from_slug(&slug),

        source,

        slug: slug.clone(),

        installs,

        url: Some(format!(
            "https://skills.sh/{}/{}",
            skill_id_parts(id).ok()?.1,
            slug
        )),
    })
}

fn parse_find_output(output: &str) -> Vec<Skill> {
    let clean_output = strip_ansi_codes(output);

    let mut skills = Vec::new();

    let lines: Vec<&str> = clean_output.lines().collect();

    let mut index = 0;

    while index < lines.len() {
        let current_line = lines[index].trim();

        let Some(mut skill) = parse_skill_result_line(current_line) else {
            index += 1;
            continue;
        };

        if index + 1 < lines.len() {
            let next_line = lines[index + 1].trim();

            let next_line = next_line
                .trim_start_matches('└')
                .trim()
                .trim_start_matches('├')
                .trim();

            if next_line.starts_with("https://skills.sh/") {
                skill.url = Some(next_line.to_string());
            }
        }

        skills.push(skill);

        index += 1;
    }

    deduplicate_skills(skills)
}

fn deduplicate_skills(skills: Vec<Skill>) -> Vec<Skill> {
    let mut result = Vec::new();

    for skill in skills {
        if !result.iter().any(|item: &Skill| item.id == skill.id) {
            result.push(skill);
        }
    }

    result
}

/* =========================================================
   GLOBAL SKILL PATH
========================================================= */

fn canonical_global_skills_directory() -> Result<PathBuf, String> {
    let home = home_directory()?;

    /*
        The Skills CLI uses ~/.agents/skills
        as the canonical universal global
        skills directory.

        We intentionally do not copy the
        skill anywhere else.
    */

    Ok(home.join(".agents").join("skills"))
}

fn find_skill_directory_by_slug(slug: &str) -> Result<PathBuf, String> {
    let canonical = canonical_global_skills_directory()?;

    let candidate = canonical.join(slug);

    if candidate.is_dir() && candidate.join("SKILL.md").is_file() {
        return Ok(candidate);
    }

    /*
        Fallback locations are kept only
        for compatibility with installations
        where the CLI/agent exposes the skill
        in an agent-specific global directory.
    */

    let home = home_directory()?;

    let candidates = vec![
        home.join(".codex").join("skills").join(slug),
        home.join(".claude").join("skills").join(slug),
        home.join(".cursor").join("skills").join(slug),
        home.join(".gemini").join("skills").join(slug),
        home.join(".config")
            .join("opencode")
            .join("skills")
            .join(slug),
        home.join(".windsurf").join("skills").join(slug),
    ];

    for candidate in candidates {
        if candidate.is_dir() && candidate.join("SKILL.md").is_file() {
            return Ok(candidate);
        }
    }

    Err(format!(
        "Skill '{slug}' is installed according to the Skills CLI, but Nexora could not locate its SKILL.md."
    ))
}

/* =========================================================
   READ GLOBAL SKILL
========================================================= */

fn read_global_skill(id: &str) -> Result<String, String> {
    let (_, _, slug) = skill_id_parts(id)?;

    let directory = find_skill_directory_by_slug(&slug)?;

    let skill_file = directory.join("SKILL.md");

    fs::read_to_string(&skill_file).map_err(|e| format!("Could not read SKILL.md: {e}"))
}

/* =========================================================
   SEARCH
========================================================= */

#[tauri::command]
async fn search_skills(query: String) -> Result<Vec<Skill>, String> {
    let query = query.trim().to_string();

    if query.len() < 2 {
        return Ok(Vec::new());
    }

    let result =
        tauri::async_runtime::spawn_blocking(move || run_bunx(&["skills", "find", query.as_str()]))
            .await
            .map_err(|e| format!("Search task failed: {e}"))??;

    if !result.success {
        return Err(command_error(&result, "Could not search Skills registry."));
    }

    Ok(parse_find_output(&result.stdout))
}

/* =========================================================
   INSTALL
========================================================= */

#[tauri::command]
async fn install_skill(app: tauri::AppHandle, id: String) -> Result<String, String> {
    let id = normalize_skill_id(&id);

    let (_, source, slug) = skill_id_parts(&id)?;

    println!("========== INSTALL SKILL ==========");

    println!("ID: {}", id);

    println!("Source: {}", source);

    println!("Slug: {}", slug);

    /*
        The official Skills CLI is the
        source of truth.

        Nexora does NOT copy the Skill.
    */

    let id_for_command = id.clone();

    let result = tauri::async_runtime::spawn_blocking(move || {
        run_bunx(&["skills", "add", &id_for_command, "-g", "-y"])
    })
    .await
    .map_err(|e| format!("Install task failed: {e}"))??;

    println!("INSTALL SUCCESS: {}", result.success);

    println!("INSTALL STDOUT:\n{}", result.stdout);

    println!("INSTALL STDERR:\n{}", result.stderr);

    if !result.success {
        return Err(command_error(&result, "Could not install skill."));
    }

    /*
        Verify that the actual Skill exists.
    */

    let skill_directory = find_skill_directory_by_slug(&slug)?;

    let skill_file = skill_directory.join("SKILL.md");

    if !skill_file.is_file() {
        return Err(format!(
            "Skill installation completed, but SKILL.md was not found at {}",
            skill_file.display()
        ));
    }

    /*
        Nexora stores ONLY lightweight
        metadata. The Skill files remain
        managed by the Skills CLI.
    */

    let root = skills_root(&app)?;

    let metadata_file = root.join(format!("{}.json", slug));

    let metadata = serde_json::json!({
        "id": id,
        "source": source,
        "slug": slug,
        "installedAt":
            chrono::Utc::now()
                .to_rfc3339(),
        "installer":
            "skills-cli",
        "runtime":
            "bun"
    });

    fs::write(
        &metadata_file,
        serde_json::to_string_pretty(&metadata).map_err(|e| e.to_string())?,
    )
    .map_err(|e| format!("Could not save Nexora metadata: {e}"))?;

    println!("Actual Skill path: {}", skill_directory.display());

    println!("Nexora metadata: {}", metadata_file.display());

    println!("===================================");

    Ok(result.stdout)
}

/* =========================================================
   UNINSTALL
========================================================= */

#[tauri::command]
async fn uninstall_skill(app: tauri::AppHandle, id: String) -> Result<String, String> {
    let id = normalize_skill_id(&id);

    println!("========== UNINSTALL SKILL ==========");

    println!("ID: {}", id);

    let id_for_command = id.clone();

    let result = tauri::async_runtime::spawn_blocking(move || {
        run_bunx(&["skills", "remove", &id_for_command, "-g", "-y"])
    })
    .await
    .map_err(|e| format!("Uninstall task failed: {e}"))??;

    println!("UNINSTALL STDOUT:\n{}", result.stdout);

    println!("UNINSTALL STDERR:\n{}", result.stderr);

    if !result.success {
        return Err(command_error(&result, "Could not uninstall skill."));
    }

    /*
        Remove ONLY Nexora metadata.

        The actual Skill directory is
        removed by the official CLI.
    */

    let (_, _, slug) = skill_id_parts(&id)?;

    let root = skills_root(&app)?;

    let metadata_file = root.join(format!("{}.json", slug));

    if metadata_file.exists() {
        fs::remove_file(&metadata_file)
            .map_err(|e| format!("Could not remove Nexora metadata: {e}"))?;
    }

    println!("Nexora metadata removed.");

    println!("=====================================");

    Ok(result.stdout)
}

/* =========================================================
   UPDATE
========================================================= */

#[tauri::command]
async fn update_skill(app: tauri::AppHandle, id: String) -> Result<String, String> {
    let id = normalize_skill_id(&id);

    println!("========== UPDATE SKILL ==========");

    println!("ID: {}", id);

    let id_for_command = id.clone();

    let result = tauri::async_runtime::spawn_blocking(move || {
        run_bunx(&["skills", "update", &id_for_command, "-y"])
    })
    .await
    .map_err(|e| format!("Update task failed: {e}"))??;

    println!("UPDATE STDOUT:\n{}", result.stdout);

    println!("UPDATE STDERR:\n{}", result.stderr);

    if !result.success {
        return Err(command_error(&result, "Could not update skill."));
    }

    /*
        Refresh Nexora metadata timestamp.
    */

    let (_, source, slug) = skill_id_parts(&id)?;

    let root = skills_root(&app)?;

    let metadata_file = root.join(format!("{}.json", slug));

    let metadata = serde_json::json!({
        "id": id,
        "source": source,
        "slug": slug,
        "updatedAt":
            chrono::Utc::now()
                .to_rfc3339(),
        "installer":
            "skills-cli",
        "runtime":
            "bun"
    });

    fs::write(
        &metadata_file,
        serde_json::to_string_pretty(&metadata).map_err(|e| e.to_string())?,
    )
    .map_err(|e| format!("Could not update Nexora metadata: {e}"))?;

    /*
        Verify the updated Skill still exists.
    */

    let skill_directory = find_skill_directory_by_slug(&slug)?;

    if !skill_directory.join("SKILL.md").is_file() {
        return Err(format!(
            "Skill update completed, but SKILL.md was not found at {}",
            skill_directory.display()
        ));
    }

    println!("==================================");

    Ok(result.stdout)
}

/* =========================================================
   LIST INSTALLED
========================================================= */

#[tauri::command]
async fn list_installed_skills(app: tauri::AppHandle) -> Result<Vec<InstalledSkill>, String> {
    println!("========== LIST INSTALLED SKILLS ==========");

    /*
        IMPORTANT:

        We ask the official Skills CLI for
        the installed state.

        Nexora does NOT scan its own copied
        Skill files anymore.
    */

    let result =
        tauri::async_runtime::spawn_blocking(move || run_bunx(&["skills", "list", "-g", "--json"]))
            .await
            .map_err(|e| format!("List task failed: {e}"))??;

    println!("LIST STDOUT:\n{}", result.stdout);

    println!("LIST STDERR:\n{}", result.stderr);

    if !result.success {
        return Err(command_error(&result, "Could not list installed skills."));
    }

    let installed = parse_installed_json(&result.stdout)?;

    /*
        Save lightweight Nexora metadata
        for skills that are currently
        installed.
    */

    let root = skills_root(&app)?;

    for skill in &installed {
        let metadata_file = root.join(format!("{}.json", skill.slug));

        let metadata = serde_json::json!({
            "id": skill.id,
            "source": skill.source,
            "slug": skill.slug,
            "syncedAt":
                chrono::Utc::now()
                    .to_rfc3339(),
            "installer":
                "skills-cli",
            "runtime":
                "bun"
        });

        if let Ok(text) = serde_json::to_string_pretty(&metadata) {
            let _ = fs::write(metadata_file, text);
        }
    }

    println!("Total installed skills: {}", installed.len());

    println!("============================================");

    Ok(installed)
}

/* =========================================================
   PARSE INSTALLED JSON
========================================================= */

fn parse_installed_json(output: &str) -> Result<Vec<InstalledSkill>, String> {
    let clean = strip_ansi_codes(output);

    /*
        The CLI may occasionally print
        informational output around JSON.

        First try parsing the complete
        response.
    */

    if let Ok(value) = serde_json::from_str::<serde_json::Value>(clean.trim()) {
        return parse_installed_json_value(value);
    }

    /*
        Fallback:

        Find the first JSON object/array
        in the output.
    */

    let start = clean.find(['[', '{']);

    let end_array = clean.rfind(']');

    let end_object = clean.rfind('}');

    let end = match (end_array, end_object) {
        (Some(a), Some(b)) => Some(a.max(b)),

        (Some(a), None) => Some(a),

        (None, Some(b)) => Some(b),

        (None, None) => None,
    };

    if let (Some(start), Some(end)) = (start, end) {
        if end >= start {
            let json_text = &clean[start..=end];

            if let Ok(value) = serde_json::from_str::<serde_json::Value>(json_text) {
                return parse_installed_json_value(value);
            }
        }
    }

    Err(format!(
        "Could not parse Skills CLI JSON output:\n{}",
        clean.trim()
    ))
}

/* =========================================================
   PARSE INSTALLED JSON VALUE
========================================================= */

fn parse_installed_json_value(value: serde_json::Value) -> Result<Vec<InstalledSkill>, String> {
    let items = if let Some(array) = value.as_array() {
        array.clone()
    } else if let Some(skills) = value.get("skills") {
        skills
            .as_array()
            .cloned()
            .ok_or_else(|| "Invalid Skills CLI JSON: 'skills' is not an array.".to_string())?
    } else {
        return Err(
            "Invalid Skills CLI JSON: expected an array or an object containing 'skills'."
                .to_string(),
        );
    };

    let mut result = Vec::new();

    for item in items {
        let object = match item.as_object() {
            Some(value) => value,

            None => continue,
        };

        /*
            Different CLI versions may expose
            slightly different field names.
        */

        let name = object
            .get("name")
            .and_then(|v| v.as_str())
            .or_else(|| object.get("skill").and_then(|v| v.as_str()))
            .or_else(|| object.get("id").and_then(|v| v.as_str()))
            .unwrap_or("")
            .trim();

        if name.is_empty() {
            continue;
        }

        let path = object
            .get("path")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string();

        /*
            Prefer an explicit source/ref/id
            if available.
        */

        let raw_id = object
            .get("id")
            .and_then(|v| v.as_str())
            .or_else(|| object.get("ref").and_then(|v| v.as_str()))
            .or_else(|| object.get("source").and_then(|v| v.as_str()))
            .unwrap_or(name);

        /*
            The list command can expose only
            a skill name/path depending on CLI
            version.

            If we already have owner/repo@skill,
            preserve it.

            Otherwise use the skill name as
            the logical ID.
        */

        let normalized_id = normalize_skill_id(raw_id);

        let (id, source, slug) = match skill_id_parts(&normalized_id) {
            Ok((id, source, slug)) => (id, source, slug),

            Err(_) => {
                let slug = name.trim_matches('/').to_string();

                (slug.clone(), String::new(), slug)
            }
        };

        result.push(InstalledSkill {
            id,
            name: if name.is_empty() {
                title_from_slug(&slug)
            } else {
                name.to_string()
            },

            source,

            slug,

            path,

            enabled: true,
        });
    }

    /*
        Deduplicate.
    */

    let mut unique = Vec::new();

    for skill in result {
        if !unique.iter().any(|item: &InstalledSkill| {
            item.id == skill.id || (!skill.slug.is_empty() && item.slug == skill.slug)
        }) {
            unique.push(skill);
        }
    }

    unique.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

    Ok(unique)
}

/* =========================================================
   READ INSTALLED SKILL
========================================================= */

#[tauri::command]
async fn read_installed_skill(id: String) -> Result<String, String> {
    let id = normalize_skill_id(&id);

    println!("========== READ SKILL ==========");

    println!("ID: {}", id);

    let content = read_global_skill(&id)?;

    println!("Skill read successfully.");

    println!("================================");

    Ok(content)
}

/* =========================================================
   AUDIT
========================================================= */

#[tauri::command]
async fn audit_skill(source: String, slug: String) -> Result<AuditResult, String> {
    let source = source.trim().trim_matches('/').to_string();

    let slug = slug.trim().trim_matches('/').to_string();

    let url = format!("https://skills.sh/api/v1/skills/audit/{source}/{slug}");

    let response = reqwest::Client::new()
        .get(url)
        .header("User-Agent", "Nexora/0.1")
        .send()
        .await
        .map_err(|e| format!("Audit request failed: {e}"))?;

    let status = response.status();

    if status == reqwest::StatusCode::NOT_FOUND {
        return Ok(AuditResult {
            id: format!("{source}/{slug}"),

            source,

            slug,

            audits: Vec::new(),
        });
    }

    if !status.is_success() {
        let body = response.text().await.unwrap_or_default();

        return Err(format!(
            "skills.sh audit returned HTTP {}: {}",
            status, body
        ));
    }

    response
        .json::<AuditResult>()
        .await
        .map_err(|e| format!("Invalid audit response: {e}"))
}

/* =========================================================
   OPEN SKILL PAGE
========================================================= */

#[tauri::command]
async fn open_skill_page(id: String) -> Result<(), String> {
    let url = skill_page_url(&id)?;

    webbrowser::open(&url).map_err(|e| format!("Could not open browser: {e}"))?;

    Ok(())
}

/* =========================================================
   GREET
========================================================= */

#[tauri::command]
async fn greet(name: &str) -> Result<String, String> {
    Ok(format!(
        "Hello, {name}! You've been greeted from the Rust backend!"
    ))
}

/* =========================================================
   TAURI
========================================================= */

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            search_skills,
            install_skill,
            uninstall_skill,
            update_skill,
            list_installed_skills,
            read_installed_skill,
            audit_skill,
            open_skill_page,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
