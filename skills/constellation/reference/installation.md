1.  A docker runtime (Docker Desktop, colima, podman) is required.
2.  Install the CLI:

    ```sh
    curl -sSL https://raw.githubusercontent.com/apollosolutions/pyxis/refs/heads/main/install.sh | VERSION=v0.1.0-alpha.8 sh
    ```

3.  Make sure it worked with `constellation --version`.
4.  Run `constellation --help` to learn more.
5.  Create a `.env` file in the project root with optional keys:

    ```sh
    # Optional: enables GraphOS integration (schema registry, usage reporting)
    APOLLO_KEY=user:...
    # Optional: powers AI agents in the constellation dashboard UI
    ANTHROPIC_API_KEY=sk-ant-...
    ```
