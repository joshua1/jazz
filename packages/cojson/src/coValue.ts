import { CoValueCore } from "./coValueCore.js";
import { RawProfile as Profile, RawAccount } from "./coValues/account.js";
import { RawCoList } from "./coValues/coList.js";
import { RawCoMap } from "./coValues/coMap.js";
import { RawCoPlainText } from "./coValues/coPlainText.js";
import { RawBinaryCoStream, RawCoStream } from "./coValues/coStream.js";
import { RawGroup } from "./coValues/group.js";
import { RawCoID } from "./ids.js";
import { JsonObject, JsonValue } from "./jsonValue.js";

export type CoID<T extends RawCoValue> = RawCoID & {
  readonly __type: T;
};

export interface RawCoValue {
  /** The `CoValue`'s (precisely typed) `CoID` */
  id: CoID<this>;
  core: CoValueCore;
  /** Specifies which kind of `CoValue` this is */
  type: string;
  /** The `CoValue`'s (precisely typed) static metadata */
  headerMeta: JsonObject | null;
  /** The `Group` this `CoValue` belongs to (determining permissions) */
  group: RawGroup;
  /** Returns an immutable JSON presentation of this `CoValue` */
  toJSON(): JsonValue;
  atTime(time: number): this;
  /** Lets you subscribe to future updates to this CoValue (whether made locally or by other users).
   *
   * Takes a listener function that will be called with the current state for each update.
   *
   * Returns an unsubscribe function.
   *
   * Used internally by `useTelepathicData()` for reactive updates on changes to a `CoValue`. */
  subscribe(listener: (coValue: this) => void): () => void;

  totalValidTransactions: number;
}

export class RawUnknownCoValue implements RawCoValue {
  id: CoID<this>;
  core: CoValueCore;
  totalValidTransactions = 0;

  constructor(core: CoValueCore) {
    this.id = core.id as CoID<this>;
    this.core = core;
  }

  get type() {
    return this.core.header.type;
  }

  get headerMeta() {
    return this.core.header.meta as JsonObject;
  }

  /** @category 6. Meta */
  get group(): RawGroup {
    return this.core.getGroup();
  }

  toJSON() {
    return {};
  }

  atTime() {
    return this;
  }

  subscribe(listener: (value: this) => void): () => void {
    return this.core.subscribe((content) => {
      listener(content as this);
    });
  }
}

export type AnyRawCoValue =
  | RawCoMap
  | RawGroup
  | RawAccount
  | Profile
  | RawCoList
  | RawCoPlainText
  | RawCoStream
  | RawBinaryCoStream;

export function expectMap(content: RawCoValue): RawCoMap {
  if (content.type !== "comap") {
    throw new Error("Expected map");
  }

  return content as RawCoMap;
}

export function expectList(content: RawCoValue): RawCoList {
  if (content.type !== "colist") {
    throw new Error("Expected list");
  }

  return content as RawCoList;
}

export function expectStream(content: RawCoValue): RawCoStream {
  if (content.type !== "costream") {
    throw new Error("Expected stream");
  }

  return content as RawCoStream;
}

export function expectPlainText(content: RawCoValue): RawCoPlainText {
  if (content.type !== "coplaintext") {
    throw new Error("Expected plaintext");
  }

  return content as RawCoPlainText;
}
