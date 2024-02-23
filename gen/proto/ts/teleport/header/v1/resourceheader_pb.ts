/* eslint-disable */
// @generated by protobuf-ts 2.9.3 with parameter long_type_number,eslint_disable,add_pb_suffix,ts_nocheck
// @generated from protobuf file "teleport/header/v1/resourceheader.proto" (package "teleport.header.v1", syntax proto3)
// tslint:disable
// @ts-nocheck
//
// Copyright 2023 Gravitational, Inc
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import { WireType } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { Metadata } from "./metadata_pb";
/**
 * ResourceHeader is a shared resource header.
 *
 * @generated from protobuf message teleport.header.v1.ResourceHeader
 */
export interface ResourceHeader {
    /**
     * kind is a resource kind.
     *
     * @generated from protobuf field: string kind = 1;
     */
    kind: string;
    /**
     * sub_kind is an optional resource sub kind, used in some resources.
     *
     * @generated from protobuf field: string sub_kind = 2;
     */
    subKind: string;
    /**
     * Version is the API version used to create the resource. It must be
     * specified. Based on this version, Teleport will apply different defaults on
     * resource creation or deletion. It must be an integer prefixed by "v".
     * For example: `v1`
     *
     * @generated from protobuf field: string version = 3;
     */
    version: string;
    /**
     * metadata is resource metadata.
     *
     * @generated from protobuf field: teleport.header.v1.Metadata metadata = 4;
     */
    metadata?: Metadata;
}
// @generated message type with reflection information, may provide speed optimized methods
class ResourceHeader$Type extends MessageType<ResourceHeader> {
    constructor() {
        super("teleport.header.v1.ResourceHeader", [
            { no: 1, name: "kind", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "sub_kind", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "version", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 4, name: "metadata", kind: "message", T: () => Metadata }
        ]);
    }
    create(value?: PartialMessage<ResourceHeader>): ResourceHeader {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.kind = "";
        message.subKind = "";
        message.version = "";
        if (value !== undefined)
            reflectionMergePartial<ResourceHeader>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: ResourceHeader): ResourceHeader {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string kind */ 1:
                    message.kind = reader.string();
                    break;
                case /* string sub_kind */ 2:
                    message.subKind = reader.string();
                    break;
                case /* string version */ 3:
                    message.version = reader.string();
                    break;
                case /* teleport.header.v1.Metadata metadata */ 4:
                    message.metadata = Metadata.internalBinaryRead(reader, reader.uint32(), options, message.metadata);
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: ResourceHeader, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string kind = 1; */
        if (message.kind !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.kind);
        /* string sub_kind = 2; */
        if (message.subKind !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.subKind);
        /* string version = 3; */
        if (message.version !== "")
            writer.tag(3, WireType.LengthDelimited).string(message.version);
        /* teleport.header.v1.Metadata metadata = 4; */
        if (message.metadata)
            Metadata.internalBinaryWrite(message.metadata, writer.tag(4, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message teleport.header.v1.ResourceHeader
 */
export const ResourceHeader = new ResourceHeader$Type();
