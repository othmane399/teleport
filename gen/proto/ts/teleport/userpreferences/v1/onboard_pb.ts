/* eslint-disable */
// @generated by protobuf-ts 2.9.3 with parameter long_type_number,eslint_disable,add_pb_suffix,server_grpc1,ts_nocheck
// @generated from protobuf file "teleport/userpreferences/v1/onboard.proto" (package "teleport.userpreferences.v1", syntax proto3)
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
/**
 * MarketingParams are the parameters associated with a user via marketing campaign at the time of sign up.
 * They contain both traditional Urchin Tracking Module (UTM) parameters as well as custom parameters.
 *
 * @generated from protobuf message teleport.userpreferences.v1.MarketingParams
 */
export interface MarketingParams {
    /**
     * campaign is the UTM campaign parameter which identifies a specific product promotion
     *
     * @generated from protobuf field: string campaign = 1;
     */
    campaign: string;
    /**
     * source is the UTM source parameter which identifies which site sent the traffic
     *
     * @generated from protobuf field: string source = 2;
     */
    source: string;
    /**
     * medium is the UTM medium parameter which identifies what type of link was used
     *
     * @generated from protobuf field: string medium = 3;
     */
    medium: string;
    /**
     * intent is the internal query param, which identifies any additional marketing intentions
     * via internally set and directed parameters.
     *
     * @generated from protobuf field: string intent = 4;
     */
    intent: string;
}
/**
 * OnboardUserPreferences is the user preferences selected during onboarding.
 *
 * @generated from protobuf message teleport.userpreferences.v1.OnboardUserPreferences
 */
export interface OnboardUserPreferences {
    /**
     * preferredResources is an array of the resources a user selected during their onboarding questionnaire.
     *
     * @generated from protobuf field: repeated teleport.userpreferences.v1.Resource preferred_resources = 1;
     */
    preferredResources: Resource[];
    /**
     * marketingParams are the parameters associated with a user via marketing campaign at the time of sign up
     *
     * @generated from protobuf field: teleport.userpreferences.v1.MarketingParams marketing_params = 2;
     */
    marketingParams?: MarketingParams;
}
/**
 * Resources are the Resource options in the onboarding questionnaire
 *
 * @generated from protobuf enum teleport.userpreferences.v1.Resource
 */
export enum Resource {
    /**
     * @generated from protobuf enum value: RESOURCE_UNSPECIFIED = 0;
     */
    UNSPECIFIED = 0,
    /**
     * @generated from protobuf enum value: RESOURCE_WINDOWS_DESKTOPS = 1;
     */
    WINDOWS_DESKTOPS = 1,
    /**
     * @generated from protobuf enum value: RESOURCE_SERVER_SSH = 2;
     */
    SERVER_SSH = 2,
    /**
     * @generated from protobuf enum value: RESOURCE_DATABASES = 3;
     */
    DATABASES = 3,
    /**
     * @generated from protobuf enum value: RESOURCE_KUBERNETES = 4;
     */
    KUBERNETES = 4,
    /**
     * @generated from protobuf enum value: RESOURCE_WEB_APPLICATIONS = 5;
     */
    WEB_APPLICATIONS = 5
}
// @generated message type with reflection information, may provide speed optimized methods
class MarketingParams$Type extends MessageType<MarketingParams> {
    constructor() {
        super("teleport.userpreferences.v1.MarketingParams", [
            { no: 1, name: "campaign", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "source", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "medium", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 4, name: "intent", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<MarketingParams>): MarketingParams {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.campaign = "";
        message.source = "";
        message.medium = "";
        message.intent = "";
        if (value !== undefined)
            reflectionMergePartial<MarketingParams>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: MarketingParams): MarketingParams {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string campaign */ 1:
                    message.campaign = reader.string();
                    break;
                case /* string source */ 2:
                    message.source = reader.string();
                    break;
                case /* string medium */ 3:
                    message.medium = reader.string();
                    break;
                case /* string intent */ 4:
                    message.intent = reader.string();
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
    internalBinaryWrite(message: MarketingParams, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string campaign = 1; */
        if (message.campaign !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.campaign);
        /* string source = 2; */
        if (message.source !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.source);
        /* string medium = 3; */
        if (message.medium !== "")
            writer.tag(3, WireType.LengthDelimited).string(message.medium);
        /* string intent = 4; */
        if (message.intent !== "")
            writer.tag(4, WireType.LengthDelimited).string(message.intent);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message teleport.userpreferences.v1.MarketingParams
 */
export const MarketingParams = new MarketingParams$Type();
// @generated message type with reflection information, may provide speed optimized methods
class OnboardUserPreferences$Type extends MessageType<OnboardUserPreferences> {
    constructor() {
        super("teleport.userpreferences.v1.OnboardUserPreferences", [
            { no: 1, name: "preferred_resources", kind: "enum", repeat: 1 /*RepeatType.PACKED*/, T: () => ["teleport.userpreferences.v1.Resource", Resource, "RESOURCE_"] },
            { no: 2, name: "marketing_params", kind: "message", T: () => MarketingParams }
        ]);
    }
    create(value?: PartialMessage<OnboardUserPreferences>): OnboardUserPreferences {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.preferredResources = [];
        if (value !== undefined)
            reflectionMergePartial<OnboardUserPreferences>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: OnboardUserPreferences): OnboardUserPreferences {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* repeated teleport.userpreferences.v1.Resource preferred_resources */ 1:
                    if (wireType === WireType.LengthDelimited)
                        for (let e = reader.int32() + reader.pos; reader.pos < e;)
                            message.preferredResources.push(reader.int32());
                    else
                        message.preferredResources.push(reader.int32());
                    break;
                case /* teleport.userpreferences.v1.MarketingParams marketing_params */ 2:
                    message.marketingParams = MarketingParams.internalBinaryRead(reader, reader.uint32(), options, message.marketingParams);
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
    internalBinaryWrite(message: OnboardUserPreferences, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* repeated teleport.userpreferences.v1.Resource preferred_resources = 1; */
        if (message.preferredResources.length) {
            writer.tag(1, WireType.LengthDelimited).fork();
            for (let i = 0; i < message.preferredResources.length; i++)
                writer.int32(message.preferredResources[i]);
            writer.join();
        }
        /* teleport.userpreferences.v1.MarketingParams marketing_params = 2; */
        if (message.marketingParams)
            MarketingParams.internalBinaryWrite(message.marketingParams, writer.tag(2, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message teleport.userpreferences.v1.OnboardUserPreferences
 */
export const OnboardUserPreferences = new OnboardUserPreferences$Type();
