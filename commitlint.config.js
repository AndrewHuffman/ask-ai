export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
        "wip",
        "agent",
      ],
    ],
    "header-max-length": [0, "always", Infinity],
    "body-max-line-length": [0, "always", Infinity],
    "subject-case": [0],
    "subject-full-stop": [0],
    "type-case": [0],
  },
};
