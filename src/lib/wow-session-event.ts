export type WowSessionStartedEvent = {
  id: string;
  type: 'session.started';
  ts: string;
  source: {
    connector_id: string;
    game: string;
    provider: string;
    version: string;
  };
  actor: {
    user_id: string;
    character_id: string;
    display_name: string;
    region: string;
    realm: string;
  };
  session: {
    session_id: string;
    platform: string;
    context: string;
  };
  consent: {
    scopes: string[];
    granted_at: string;
  };
  payload: {
    encounter: string | null;
    data: Record<string, unknown>;
  };
};

const toScalar = (value: string): unknown => {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  if (trimmed === 'null') {
    return null;
  }
  if (trimmed === '{}') {
    return {};
  }
  if (trimmed === '[]') {
    return [];
  }
  if (trimmed === 'true') {
    return true;
  }
  if (trimmed === 'false') {
    return false;
  }
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }

  const numeric = Number(trimmed);
  if (!Number.isNaN(numeric) && trimmed === String(numeric)) {
    return numeric;
  }

  return trimmed;
};

type Container = Record<string, unknown> | unknown[];

type StackEntry = {
  indent: number;
  key?: string;
  container: Container;
};

const ensureObject = (value: unknown): Record<string, unknown> => {
  if (!value || Array.isArray(value) || typeof value !== 'object') {
    return {};
  }
  return value as Record<string, unknown>;
};

const parseLooseYaml = (input: string): Record<string, unknown> => {
  const lines = input.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const root: Record<string, unknown> = {};
  const stack: StackEntry[] = [{ indent: -1, container: root }];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const rawLine = lines[lineIndex];
    const indent = rawLine.search(/\S|$/);
    const line = rawLine.trim();

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1];

    if (line.startsWith('- ')) {
      const itemValue = line.slice(2).trim();
      if (!Array.isArray(parent.container)) {
        if (!parent.key || !stack[stack.length - 2]) {
          throw new Error('Invalid list placement in event payload');
        }
        const grandParent = ensureObject(stack[stack.length - 2].container);
        const forcedArray: unknown[] = [];
        grandParent[parent.key] = forcedArray;
        parent.container = forcedArray;
      }
      (parent.container as unknown[]).push(toScalar(itemValue));
      continue;
    }

    const separatorIndex = line.indexOf(':');
    if (separatorIndex < 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const valuePart = line.slice(separatorIndex + 1).trim();

    const parentObject = ensureObject(parent.container);

    if (!valuePart) {
      const nextNonEmpty = lines.slice(lineIndex + 1).find((candidate) => candidate.trim().length > 0);
      const nextIsList = Boolean(nextNonEmpty?.trim().startsWith('- '));
      const nextContainer: Container = nextIsList ? [] : {};
      parentObject[key] = nextContainer;
      stack.push({ indent, key, container: nextContainer });
      continue;
    }

    parentObject[key] = toScalar(valuePart);
  }

  return root;
};

const asString = (value: unknown, fieldName: string): string => {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Expected ${fieldName} to be a non-empty string`);
  }
  return value;
};

export const parseWowSessionStartedEvent = (rawEvent: string): WowSessionStartedEvent => {
  const parsed = parseLooseYaml(rawEvent);
  const source = ensureObject(parsed.source);
  const actor = ensureObject(parsed.actor);
  const session = ensureObject(parsed.session);
  const consent = ensureObject(parsed.consent);
  const payload = ensureObject(parsed.payload);

  return {
    id: asString(parsed.id, 'id'),
    type: asString(parsed.type, 'type') as WowSessionStartedEvent['type'],
    ts: asString(parsed.ts, 'ts'),
    source: {
      connector_id: asString(source.connector_id, 'source.connector_id'),
      game: asString(source.game, 'source.game'),
      provider: asString(source.provider, 'source.provider'),
      version: asString(source.version, 'source.version'),
    },
    actor: {
      user_id: asString(actor.user_id, 'actor.user_id'),
      character_id: asString(actor.character_id, 'actor.character_id'),
      display_name: asString(actor.display_name, 'actor.display_name'),
      region: asString(actor.region, 'actor.region'),
      realm: asString(actor.realm, 'actor.realm'),
    },
    session: {
      session_id: asString(session.session_id, 'session.session_id'),
      platform: asString(session.platform, 'session.platform'),
      context: asString(session.context, 'session.context'),
    },
    consent: {
      scopes: Array.isArray(consent.scopes) ? consent.scopes.map((entry) => asString(entry, 'consent.scopes[]')) : [],
      granted_at: asString(consent.granted_at, 'consent.granted_at'),
    },
    payload: {
      encounter: payload.encounter === null ? null : typeof payload.encounter === 'string' ? payload.encounter : null,
      data: ensureObject(payload.data),
    },
  };
};
