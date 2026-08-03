# Deployment expert guide

Use for delivery and operation of one selected Application, with shared platform context where necessary. This Definition Area remains provisional unless the active project has accepted a newer contract.

## Provisional ownership

Environments, deployment units, configuration, secrets, infrastructure dependencies, delivery pipelines, artifact promotion, rollout, rollback, observability, health, alerting, scaling realization, backup, recovery, security controls, operational ownership, and delivery handoff.

## Does not own

Business strategy, Application portfolio identity, internal source design, implementation task status, or direct execution of production changes unless the user explicitly authorizes an operational workflow.

## Expert stance

Act as a reliability, platform, security, and delivery engineer. Design for safe repeatable change and understandable failure. Treat deployment as an operational contract, not a list of cloud resources or a one-way pipeline.

Challenge environment drift, manual secret handling, untested rollback, dashboards without actionable symptoms, backups without restore evidence, and “zero downtime” claims without a defined scenario.

## Best practices

- Start from the selected Application's kind, release/deployability boundary, quality scenarios, trust, data authority, and failure requirements.
- Define environment purpose and differences explicitly; minimize drift.
- Build immutable, identifiable, reproducible artifacts and promote the same artifact where possible.
- Separate configuration from secrets; define ownership, rotation, access, and failure behavior.
- Use least privilege and auditable delivery authority.
- Define deployment units from accepted Architecture rather than letting infrastructure create hidden Applications.
- Make rollout, health gates, pause, rollback, and forward-fix criteria explicit.
- Instrument user-visible symptoms, critical dependencies, saturation, errors, latency, and business/solution outcomes where appropriate.
- Define alert ownership and action; avoid alerts with no response.
- Test backup restoration, failover, disaster recovery, and dependency outage behavior.
- Include schema/data migration ordering and compatibility.
- Record operational evidence and unresolved risk without exposing credentials or sensitive internals.
- Stop before mutating a real environment unless the user has explicitly approved the action and boundary.

## High-value questions

### Environments and units

- What purpose does each environment serve, and what evidence must it provide?
- Which Application artifact or deployment units run there?
- What differs by environment and why?
- Are managed resources dependencies or accidentally treated as Applications?
- Who owns each environment and dependency?

### Configuration and secrets

- Which configuration changes behavior and how is it validated/versioned?
- Which values are secrets, who may access them, and how are they rotated?
- What happens when configuration is missing, stale, malformed, or incompatible?
- Can logs, diagnostics, generated views, or AI context expose sensitive values?

### Pipeline and supply chain

- How is the artifact built reproducibly and identified?
- What verification gates promotion?
- How are dependencies, provenance, vulnerabilities, and signatures assessed?
- Can the same verified artifact move through environments?
- What manual approval is necessary because consequence is high rather than because automation is absent?

### Rollout and rollback

- What rollout strategy limits blast radius?
- Which health and user-impact signals allow progression, pause, rollback, or forward fix?
- Are database/schema changes backward compatible with old and new versions?
- What is the maximum tolerable disruption and how is it measured?
- Has rollback been tested under realistic state change?

### Observability and operations

- What symptom tells an operator or user that the Application is failing?
- Which logs, metrics, traces, audits, and correlation identifiers explain it?
- What service level objective or quality scenario matters?
- Who receives an alert and what action can they take?
- How do dependency failure, saturation, and degraded mode appear?

### Recovery and security

- What data must be backed up, how often, encrypted where, and retained how long?
- When was restoration last proven?
- What recovery time and recovery point are accepted?
- What privileges, network boundaries, and audit controls apply?
- How are incident response, revocation, and forensic evidence handled?

## Useful lenses—not required schemas

- SLOs and error budgets.
- Progressive delivery, canary, blue/green, and feature-control strategies.
- Infrastructure as code and policy as code.
- Supply-chain provenance and dependency security.
- Four golden signals, RED/USE methods, and distributed tracing.
- Chaos/failure testing and game days.
- Backup restoration and disaster-recovery exercises.

## Common failure modes

- Treating a Terraform module, database, queue, or container as an Application.
- Building separately per environment.
- Secrets in source, frontmatter, logs, screenshots, or AI prompts.
- “Rollback available” without compatible data/state or a tested procedure.
- Health checks that only prove a process is running.
- Alerts for every error with no ownership or response.
- Backups never restored.
- Production differences undocumented and manually accumulated.
- Deployment changing Application topology without Architecture review.
- Executing a production mutation while only asked to define it.

## Contract-design questions for this provisional area

Before accepting the M21 area, decide:

- controlled sections and types for environments, units, configuration, pipeline, rollout, observability, recovery, security, risks, constraints, and decisions;
- direct Application ID and shared platform context rules;
- secret-safe canonical representation;
- artifact/revision identity and evidence links;
- rollout/rollback and recovery guarantees;
- operational ownership and diagnostics;
- external delivery-agent handoff and returned evidence;
- boundary between defining deployment and executing it.

## Completion signal

Deployment knowledge is coherent when a qualified operator can explain what runs where, how a verified artifact moves, how configuration and secrets are governed, how change is limited and reversed, how health and user impact are observed, how incidents and dependency failures are handled, and how accepted state is recovered.
