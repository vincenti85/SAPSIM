export type ScenarioVersion = {
  id: string
  parentVersionId?: string
  name: string
  status: 'draft' | 'published'
  assumptions: Record<string, number>
  createdBy: string
  publishedBy?: string
}

export class ScenarioBook {
  private readonly versions = new Map<string, ScenarioVersion>()
  private sequence = 0

  create(input: {
    name: string
    assumptions: Record<string, number>
    createdBy: string
  }): ScenarioVersion {
    const version: ScenarioVersion = {
      id: `scenario-${++this.sequence}`,
      name: input.name,
      status: 'draft',
      assumptions: { ...input.assumptions },
      createdBy: input.createdBy,
    }
    this.versions.set(version.id, version)
    return this.copy(version)
  }

  publish(id: string, actorId: string): ScenarioVersion {
    const version = this.requireVersion(id)
    version.status = 'published'
    version.publishedBy = actorId
    return this.copy(version)
  }

  clone(
    id: string,
    input: { name: string; createdBy: string },
  ): ScenarioVersion {
    const source = this.requireVersion(id)
    const clone: ScenarioVersion = {
      id: `scenario-${++this.sequence}`,
      parentVersionId: source.id,
      name: input.name,
      status: 'draft',
      assumptions: { ...source.assumptions },
      createdBy: input.createdBy,
    }
    this.versions.set(clone.id, clone)
    return this.copy(clone)
  }

  updateAssumptions(
    id: string,
    changes: Record<string, number>,
  ): ScenarioVersion {
    const version = this.requireVersion(id)
    if (version.status === 'published') {
      throw new Error('Published scenarios are immutable')
    }
    for (const [key, value] of Object.entries(changes)) {
      if (!Number.isFinite(value)) throw new Error(`Invalid assumption: ${key}`)
    }
    version.assumptions = { ...version.assumptions, ...changes }
    return this.copy(version)
  }

  get(id: string): ScenarioVersion {
    return this.copy(this.requireVersion(id))
  }

  private requireVersion(id: string): ScenarioVersion {
    const version = this.versions.get(id)
    if (!version) throw new Error('Scenario version not found')
    return version
  }

  private copy(version: ScenarioVersion): ScenarioVersion {
    return { ...version, assumptions: { ...version.assumptions } }
  }
}
