# Fable Generator Skill

A reusable Trae skill for generating AI-narrated fable stories that illustrate postgraduate-level technical concepts through indirect metaphors.

## Features

- **Domain-Specific**: Focuses on computer science concepts (computer systems, C++, Python, algorithms, LLMs)
- **Narrative-Driven**: Creates engaging fables that reveal the technical concept near the conclusion
- **Educational**: Includes detailed explanations and metaphor mappings
- **Reusable**: Designed for on-demand invocation in various Trae agents

## Usage

### Input Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `domain` | string | Target domain: `computer_systems`, `cpp`, `python`, `algorithms`, `llm` |
| `concept` | string | Optional: Specific concept to illustrate (auto-selected if not provided) |
| `output_path` | string | Optional: Output directory for generated content |

### Example Invocation

```yaml
技能: fable-generator
参数:
  domain: "llm"
  output_path: "source/_posts/AI讲的寓言故事/"
```

## Output Format

The skill generates a Markdown file with:
1. YAML frontmatter (title, tags, date)
2. Story content with chapters
3. Concept explanation
4. Metaphor mapping table
5. Technical insights

## Project Structure

```
fable-generator/
├── SKILL.md          # Skill definition and documentation
├── README.md         # GitHub-friendly documentation
└── examples/         # Example outputs (optional)
```

## Requirements

- Trae Agent environment
- Markdown rendering support

## License

MIT License

## Contributing

Contributions are welcome! Please submit issues and pull requests.

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-06-02 | Initial release |