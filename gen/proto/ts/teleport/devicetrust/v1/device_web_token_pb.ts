/* eslint-disable */
// @generated by protobuf-ts 2.9.3 with parameter long_type_number,eslint_disable,add_pb_suffix,server_grpc1,ts_nocheck
// @generated from protobuf file "teleport/devicetrust/v1/device_web_token.proto" (package "teleport.devicetrust.v1", syntax proto3)
// tslint:disable
// @ts-nocheck
//
// Copyright 2024 Gravitational, Inc
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
 * A device web token is a token used to device-authenticate a Web UI session.
 *
 * Tokens are generally acquired on login and exchanged for a single
 * on-behalf-of device authentication attempt, performed by Connect.
 *
 * See
 * https://github.com/gravitational/teleport.e/blob/master/rfd/0009e-device-trust-web-support.md#device-web-token.
 *
 * @generated from protobuf message teleport.devicetrust.v1.DeviceWebToken
 */
export interface DeviceWebToken {
    /**
     * Opaque token identifier.
     * Required for token usage.
     * System-generated.
     *
     * @generated from protobuf field: string id = 1;
     */
    id: string;
    /**
     * Opaque device web token, in plaintext, encoded in base64.RawURLEncoding
     * (so it is inherently safe for URl use).
     * Required for token usage.
     * System-generated.
     *
     * @generated from protobuf field: string token = 2;
     */
    token: string;
    /**
     * Identifier for the Web Session being device-authorized.
     * Required for creation.
     *
     * @generated from protobuf field: string web_session_id = 3;
     */
    webSessionId: string;
    /**
     * Browser user agent, as acquired from the Web UI browser.
     * Used as part of expected device checks.
     * Required for creation.
     *
     * @generated from protobuf field: string browser_user_agent = 4;
     */
    browserUserAgent: string;
    /**
     * Browser public IP, as acquired from the Web UI browser.
     * Used as part of expected device checks.
     * Required for creation.
     *
     * @generated from protobuf field: string browser_ip = 5;
     */
    browserIp: string;
    /**
     * Owner of the Web Session and trusted device.
     * Used internally by the Device Trust system.
     * Transient.
     *
     * @generated from protobuf field: string user = 6;
     */
    user: string;
    /**
     * ID of the devices allowed to perform on-behalf-of device authentication.
     * Used internally by the Device Trust system.
     * Transient.
     *
     * @generated from protobuf field: repeated string expected_device_ids = 7;
     */
    expectedDeviceIds: string[];
}
// @generated message type with reflection information, may provide speed optimized methods
class DeviceWebToken$Type extends MessageType<DeviceWebToken> {
    constructor() {
        super("teleport.devicetrust.v1.DeviceWebToken", [
            { no: 1, name: "id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "token", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "web_session_id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 4, name: "browser_user_agent", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 5, name: "browser_ip", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 6, name: "user", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 7, name: "expected_device_ids", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<DeviceWebToken>): DeviceWebToken {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.id = "";
        message.token = "";
        message.webSessionId = "";
        message.browserUserAgent = "";
        message.browserIp = "";
        message.user = "";
        message.expectedDeviceIds = [];
        if (value !== undefined)
            reflectionMergePartial<DeviceWebToken>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: DeviceWebToken): DeviceWebToken {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string id */ 1:
                    message.id = reader.string();
                    break;
                case /* string token */ 2:
                    message.token = reader.string();
                    break;
                case /* string web_session_id */ 3:
                    message.webSessionId = reader.string();
                    break;
                case /* string browser_user_agent */ 4:
                    message.browserUserAgent = reader.string();
                    break;
                case /* string browser_ip */ 5:
                    message.browserIp = reader.string();
                    break;
                case /* string user */ 6:
                    message.user = reader.string();
                    break;
                case /* repeated string expected_device_ids */ 7:
                    message.expectedDeviceIds.push(reader.string());
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
    internalBinaryWrite(message: DeviceWebToken, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string id = 1; */
        if (message.id !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.id);
        /* string token = 2; */
        if (message.token !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.token);
        /* string web_session_id = 3; */
        if (message.webSessionId !== "")
            writer.tag(3, WireType.LengthDelimited).string(message.webSessionId);
        /* string browser_user_agent = 4; */
        if (message.browserUserAgent !== "")
            writer.tag(4, WireType.LengthDelimited).string(message.browserUserAgent);
        /* string browser_ip = 5; */
        if (message.browserIp !== "")
            writer.tag(5, WireType.LengthDelimited).string(message.browserIp);
        /* string user = 6; */
        if (message.user !== "")
            writer.tag(6, WireType.LengthDelimited).string(message.user);
        /* repeated string expected_device_ids = 7; */
        for (let i = 0; i < message.expectedDeviceIds.length; i++)
            writer.tag(7, WireType.LengthDelimited).string(message.expectedDeviceIds[i]);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message teleport.devicetrust.v1.DeviceWebToken
 */
export const DeviceWebToken = new DeviceWebToken$Type();
