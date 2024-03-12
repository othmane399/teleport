/* eslint-disable */
// @generated by protobuf-ts 2.9.3 with parameter long_type_number,eslint_disable,add_pb_suffix,server_grpc1,ts_nocheck
// @generated from protobuf file "teleport/lib/teleterm/v1/access_request.proto" (package "teleport.lib.teleterm.v1", syntax proto3)
// tslint:disable
// @ts-nocheck
//
//
// Teleport
// Copyright (C) 2023  Gravitational, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
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
import { Timestamp } from "../../../../google/protobuf/timestamp_pb";
/**
 * @generated from protobuf message teleport.lib.teleterm.v1.AccessRequest
 */
export interface AccessRequest {
    /**
     * @generated from protobuf field: string id = 1;
     */
    id: string;
    /**
     * the request state of Access Request. option of PENDING, APPROVED, DENIED, PROMOTED, NONE
     *
     * @generated from protobuf field: string state = 2;
     */
    state: string;
    /**
     * @generated from protobuf field: string resolve_reason = 3;
     */
    resolveReason: string;
    /**
     * @generated from protobuf field: string request_reason = 4;
     */
    requestReason: string;
    /**
     * user is the user who submitted the Access Request
     *
     * @generated from protobuf field: string user = 5;
     */
    user: string;
    /**
     * a list of roles requested in the AccessRequest
     *
     * @generated from protobuf field: repeated string roles = 6;
     */
    roles: string[];
    /**
     * @generated from protobuf field: google.protobuf.Timestamp created = 7;
     */
    created?: Timestamp;
    /**
     * @generated from protobuf field: google.protobuf.Timestamp expires = 8;
     */
    expires?: Timestamp;
    /**
     * @generated from protobuf field: repeated teleport.lib.teleterm.v1.AccessRequestReview reviews = 9;
     */
    reviews: AccessRequestReview[];
    /**
     * @generated from protobuf field: repeated string suggested_reviewers = 10;
     */
    suggestedReviewers: string[];
    /**
     * thresholds specifies minimum amount of approvers or deniers. Defaults to 'default'
     *
     * @generated from protobuf field: repeated string threshold_names = 11;
     */
    thresholdNames: string[];
    /**
     * TODO(avatus) remove the resource_ids field once the changes to rely on resources instead is merged
     * a list of resourceIDs requested in the AccessRequest
     *
     * @generated from protobuf field: repeated teleport.lib.teleterm.v1.ResourceID resource_ids = 12;
     */
    resourceIds: ResourceID[];
    /**
     * @generated from protobuf field: repeated teleport.lib.teleterm.v1.Resource resources = 13;
     */
    resources: Resource[];
    /**
     * promoted_access_list_title is the title of the access
     * list that this access request was promoted to.
     *
     * @generated from protobuf field: string promoted_access_list_title = 14;
     */
    promotedAccessListTitle: string;
}
/**
 * @generated from protobuf message teleport.lib.teleterm.v1.AccessRequestReview
 */
export interface AccessRequestReview {
    /**
     * author is the creator of the AccessRequestReview.
     *
     * @generated from protobuf field: string author = 1;
     */
    author: string;
    /**
     * list of roles approved
     *
     * @generated from protobuf field: repeated string roles = 2;
     */
    roles: string[];
    /**
     * the state of the review, either APPROVED or DENIED
     *
     * @generated from protobuf field: string state = 3;
     */
    state: string;
    /**
     * reason is why the request was approved or denied
     *
     * @generated from protobuf field: string reason = 4;
     */
    reason: string;
    /**
     * @generated from protobuf field: google.protobuf.Timestamp created = 5;
     */
    created?: Timestamp;
    /**
     * promoted_access_list_title is the title of the access
     * list that the access request was promoted to.
     *
     * @generated from protobuf field: string promoted_access_list_title = 6;
     */
    promotedAccessListTitle: string;
}
/**
 * @generated from protobuf message teleport.lib.teleterm.v1.ResourceID
 */
export interface ResourceID {
    /**
     * @generated from protobuf field: string kind = 1;
     */
    kind: string;
    /**
     * @generated from protobuf field: string name = 2;
     */
    name: string;
    /**
     * @generated from protobuf field: string cluster_name = 3;
     */
    clusterName: string;
    /**
     * @generated from protobuf field: string sub_resource_name = 4;
     */
    subResourceName: string;
}
/**
 * @generated from protobuf message teleport.lib.teleterm.v1.ResourceDetails
 */
export interface ResourceDetails {
    /**
     * @generated from protobuf field: string hostname = 1;
     */
    hostname: string;
    /**
     * @generated from protobuf field: string friendly_name = 2;
     */
    friendlyName: string;
}
/**
 * @generated from protobuf message teleport.lib.teleterm.v1.Resource
 */
export interface Resource {
    /**
     * @generated from protobuf field: teleport.lib.teleterm.v1.ResourceID id = 1;
     */
    id?: ResourceID;
    /**
     * @generated from protobuf field: teleport.lib.teleterm.v1.ResourceDetails details = 2;
     */
    details?: ResourceDetails;
}
// @generated message type with reflection information, may provide speed optimized methods
class AccessRequest$Type extends MessageType<AccessRequest> {
    constructor() {
        super("teleport.lib.teleterm.v1.AccessRequest", [
            { no: 1, name: "id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "state", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "resolve_reason", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 4, name: "request_reason", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 5, name: "user", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 6, name: "roles", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 7, name: "created", kind: "message", T: () => Timestamp },
            { no: 8, name: "expires", kind: "message", T: () => Timestamp },
            { no: 9, name: "reviews", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => AccessRequestReview },
            { no: 10, name: "suggested_reviewers", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 11, name: "threshold_names", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 12, name: "resource_ids", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => ResourceID },
            { no: 13, name: "resources", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => Resource },
            { no: 14, name: "promoted_access_list_title", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<AccessRequest>): AccessRequest {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.id = "";
        message.state = "";
        message.resolveReason = "";
        message.requestReason = "";
        message.user = "";
        message.roles = [];
        message.reviews = [];
        message.suggestedReviewers = [];
        message.thresholdNames = [];
        message.resourceIds = [];
        message.resources = [];
        message.promotedAccessListTitle = "";
        if (value !== undefined)
            reflectionMergePartial<AccessRequest>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: AccessRequest): AccessRequest {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string id */ 1:
                    message.id = reader.string();
                    break;
                case /* string state */ 2:
                    message.state = reader.string();
                    break;
                case /* string resolve_reason */ 3:
                    message.resolveReason = reader.string();
                    break;
                case /* string request_reason */ 4:
                    message.requestReason = reader.string();
                    break;
                case /* string user */ 5:
                    message.user = reader.string();
                    break;
                case /* repeated string roles */ 6:
                    message.roles.push(reader.string());
                    break;
                case /* google.protobuf.Timestamp created */ 7:
                    message.created = Timestamp.internalBinaryRead(reader, reader.uint32(), options, message.created);
                    break;
                case /* google.protobuf.Timestamp expires */ 8:
                    message.expires = Timestamp.internalBinaryRead(reader, reader.uint32(), options, message.expires);
                    break;
                case /* repeated teleport.lib.teleterm.v1.AccessRequestReview reviews */ 9:
                    message.reviews.push(AccessRequestReview.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                case /* repeated string suggested_reviewers */ 10:
                    message.suggestedReviewers.push(reader.string());
                    break;
                case /* repeated string threshold_names */ 11:
                    message.thresholdNames.push(reader.string());
                    break;
                case /* repeated teleport.lib.teleterm.v1.ResourceID resource_ids */ 12:
                    message.resourceIds.push(ResourceID.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                case /* repeated teleport.lib.teleterm.v1.Resource resources */ 13:
                    message.resources.push(Resource.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                case /* string promoted_access_list_title */ 14:
                    message.promotedAccessListTitle = reader.string();
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
    internalBinaryWrite(message: AccessRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string id = 1; */
        if (message.id !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.id);
        /* string state = 2; */
        if (message.state !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.state);
        /* string resolve_reason = 3; */
        if (message.resolveReason !== "")
            writer.tag(3, WireType.LengthDelimited).string(message.resolveReason);
        /* string request_reason = 4; */
        if (message.requestReason !== "")
            writer.tag(4, WireType.LengthDelimited).string(message.requestReason);
        /* string user = 5; */
        if (message.user !== "")
            writer.tag(5, WireType.LengthDelimited).string(message.user);
        /* repeated string roles = 6; */
        for (let i = 0; i < message.roles.length; i++)
            writer.tag(6, WireType.LengthDelimited).string(message.roles[i]);
        /* google.protobuf.Timestamp created = 7; */
        if (message.created)
            Timestamp.internalBinaryWrite(message.created, writer.tag(7, WireType.LengthDelimited).fork(), options).join();
        /* google.protobuf.Timestamp expires = 8; */
        if (message.expires)
            Timestamp.internalBinaryWrite(message.expires, writer.tag(8, WireType.LengthDelimited).fork(), options).join();
        /* repeated teleport.lib.teleterm.v1.AccessRequestReview reviews = 9; */
        for (let i = 0; i < message.reviews.length; i++)
            AccessRequestReview.internalBinaryWrite(message.reviews[i], writer.tag(9, WireType.LengthDelimited).fork(), options).join();
        /* repeated string suggested_reviewers = 10; */
        for (let i = 0; i < message.suggestedReviewers.length; i++)
            writer.tag(10, WireType.LengthDelimited).string(message.suggestedReviewers[i]);
        /* repeated string threshold_names = 11; */
        for (let i = 0; i < message.thresholdNames.length; i++)
            writer.tag(11, WireType.LengthDelimited).string(message.thresholdNames[i]);
        /* repeated teleport.lib.teleterm.v1.ResourceID resource_ids = 12; */
        for (let i = 0; i < message.resourceIds.length; i++)
            ResourceID.internalBinaryWrite(message.resourceIds[i], writer.tag(12, WireType.LengthDelimited).fork(), options).join();
        /* repeated teleport.lib.teleterm.v1.Resource resources = 13; */
        for (let i = 0; i < message.resources.length; i++)
            Resource.internalBinaryWrite(message.resources[i], writer.tag(13, WireType.LengthDelimited).fork(), options).join();
        /* string promoted_access_list_title = 14; */
        if (message.promotedAccessListTitle !== "")
            writer.tag(14, WireType.LengthDelimited).string(message.promotedAccessListTitle);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message teleport.lib.teleterm.v1.AccessRequest
 */
export const AccessRequest = new AccessRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class AccessRequestReview$Type extends MessageType<AccessRequestReview> {
    constructor() {
        super("teleport.lib.teleterm.v1.AccessRequestReview", [
            { no: 1, name: "author", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "roles", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "state", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 4, name: "reason", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 5, name: "created", kind: "message", T: () => Timestamp },
            { no: 6, name: "promoted_access_list_title", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<AccessRequestReview>): AccessRequestReview {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.author = "";
        message.roles = [];
        message.state = "";
        message.reason = "";
        message.promotedAccessListTitle = "";
        if (value !== undefined)
            reflectionMergePartial<AccessRequestReview>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: AccessRequestReview): AccessRequestReview {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string author */ 1:
                    message.author = reader.string();
                    break;
                case /* repeated string roles */ 2:
                    message.roles.push(reader.string());
                    break;
                case /* string state */ 3:
                    message.state = reader.string();
                    break;
                case /* string reason */ 4:
                    message.reason = reader.string();
                    break;
                case /* google.protobuf.Timestamp created */ 5:
                    message.created = Timestamp.internalBinaryRead(reader, reader.uint32(), options, message.created);
                    break;
                case /* string promoted_access_list_title */ 6:
                    message.promotedAccessListTitle = reader.string();
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
    internalBinaryWrite(message: AccessRequestReview, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string author = 1; */
        if (message.author !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.author);
        /* repeated string roles = 2; */
        for (let i = 0; i < message.roles.length; i++)
            writer.tag(2, WireType.LengthDelimited).string(message.roles[i]);
        /* string state = 3; */
        if (message.state !== "")
            writer.tag(3, WireType.LengthDelimited).string(message.state);
        /* string reason = 4; */
        if (message.reason !== "")
            writer.tag(4, WireType.LengthDelimited).string(message.reason);
        /* google.protobuf.Timestamp created = 5; */
        if (message.created)
            Timestamp.internalBinaryWrite(message.created, writer.tag(5, WireType.LengthDelimited).fork(), options).join();
        /* string promoted_access_list_title = 6; */
        if (message.promotedAccessListTitle !== "")
            writer.tag(6, WireType.LengthDelimited).string(message.promotedAccessListTitle);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message teleport.lib.teleterm.v1.AccessRequestReview
 */
export const AccessRequestReview = new AccessRequestReview$Type();
// @generated message type with reflection information, may provide speed optimized methods
class ResourceID$Type extends MessageType<ResourceID> {
    constructor() {
        super("teleport.lib.teleterm.v1.ResourceID", [
            { no: 1, name: "kind", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "cluster_name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 4, name: "sub_resource_name", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<ResourceID>): ResourceID {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.kind = "";
        message.name = "";
        message.clusterName = "";
        message.subResourceName = "";
        if (value !== undefined)
            reflectionMergePartial<ResourceID>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: ResourceID): ResourceID {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string kind */ 1:
                    message.kind = reader.string();
                    break;
                case /* string name */ 2:
                    message.name = reader.string();
                    break;
                case /* string cluster_name */ 3:
                    message.clusterName = reader.string();
                    break;
                case /* string sub_resource_name */ 4:
                    message.subResourceName = reader.string();
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
    internalBinaryWrite(message: ResourceID, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string kind = 1; */
        if (message.kind !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.kind);
        /* string name = 2; */
        if (message.name !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.name);
        /* string cluster_name = 3; */
        if (message.clusterName !== "")
            writer.tag(3, WireType.LengthDelimited).string(message.clusterName);
        /* string sub_resource_name = 4; */
        if (message.subResourceName !== "")
            writer.tag(4, WireType.LengthDelimited).string(message.subResourceName);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message teleport.lib.teleterm.v1.ResourceID
 */
export const ResourceID = new ResourceID$Type();
// @generated message type with reflection information, may provide speed optimized methods
class ResourceDetails$Type extends MessageType<ResourceDetails> {
    constructor() {
        super("teleport.lib.teleterm.v1.ResourceDetails", [
            { no: 1, name: "hostname", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "friendly_name", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<ResourceDetails>): ResourceDetails {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.hostname = "";
        message.friendlyName = "";
        if (value !== undefined)
            reflectionMergePartial<ResourceDetails>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: ResourceDetails): ResourceDetails {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string hostname */ 1:
                    message.hostname = reader.string();
                    break;
                case /* string friendly_name */ 2:
                    message.friendlyName = reader.string();
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
    internalBinaryWrite(message: ResourceDetails, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string hostname = 1; */
        if (message.hostname !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.hostname);
        /* string friendly_name = 2; */
        if (message.friendlyName !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.friendlyName);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message teleport.lib.teleterm.v1.ResourceDetails
 */
export const ResourceDetails = new ResourceDetails$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Resource$Type extends MessageType<Resource> {
    constructor() {
        super("teleport.lib.teleterm.v1.Resource", [
            { no: 1, name: "id", kind: "message", T: () => ResourceID },
            { no: 2, name: "details", kind: "message", T: () => ResourceDetails }
        ]);
    }
    create(value?: PartialMessage<Resource>): Resource {
        const message = globalThis.Object.create((this.messagePrototype!));
        if (value !== undefined)
            reflectionMergePartial<Resource>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Resource): Resource {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* teleport.lib.teleterm.v1.ResourceID id */ 1:
                    message.id = ResourceID.internalBinaryRead(reader, reader.uint32(), options, message.id);
                    break;
                case /* teleport.lib.teleterm.v1.ResourceDetails details */ 2:
                    message.details = ResourceDetails.internalBinaryRead(reader, reader.uint32(), options, message.details);
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
    internalBinaryWrite(message: Resource, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* teleport.lib.teleterm.v1.ResourceID id = 1; */
        if (message.id)
            ResourceID.internalBinaryWrite(message.id, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        /* teleport.lib.teleterm.v1.ResourceDetails details = 2; */
        if (message.details)
            ResourceDetails.internalBinaryWrite(message.details, writer.tag(2, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message teleport.lib.teleterm.v1.Resource
 */
export const Resource = new Resource$Type();
