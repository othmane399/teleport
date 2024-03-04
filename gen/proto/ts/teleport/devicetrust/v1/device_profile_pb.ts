/* eslint-disable */
// @generated by protobuf-ts 2.9.3 with parameter long_type_number,eslint_disable,add_pb_suffix,ts_nocheck
// @generated from protobuf file "teleport/devicetrust/v1/device_profile.proto" (package "teleport.devicetrust.v1", syntax proto3)
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
import { Timestamp } from "../../../google/protobuf/timestamp_pb";
/**
 * Device profile information acquired from an external source.
 * If present, it's used to further validate collected data.
 *
 * @generated from protobuf message teleport.devicetrust.v1.DeviceProfile
 */
export interface DeviceProfile {
    /**
     * Latest profile update time.
     * System managed.
     *
     * @generated from protobuf field: google.protobuf.Timestamp update_time = 1;
     */
    updateTime?: Timestamp;
    /**
     * Non-descriptive model identifier.
     * Example: "MacBookPro9,2".
     *
     * @generated from protobuf field: string model_identifier = 2;
     */
    modelIdentifier: string;
    /**
     * OS version number, without the leading 'v'.
     * See the Device's os_type for the general OS category.
     * Example: "13.2.1".
     *
     * @generated from protobuf field: string os_version = 3;
     */
    osVersion: string;
    /**
     * OS build identifier. Augments the os_version.
     * Example: "22D68".
     *
     * @generated from protobuf field: string os_build = 4;
     */
    osBuild: string;
    /**
     * Known OS users (distinct from the Teleport user).
     *
     * @generated from protobuf field: repeated string os_usernames = 5;
     */
    osUsernames: string[];
    /**
     * Jamf binary version, without the leading 'v'.
     * Example: "9.27" or "10.44.1-t1677509507".
     *
     * @generated from protobuf field: string jamf_binary_version = 6;
     */
    jamfBinaryVersion: string;
    /**
     * External device identifier, for example the Jamf or Intune ID.
     *
     * @generated from protobuf field: string external_id = 7;
     */
    externalId: string;
    /**
     * OS build supplemental number.
     * May match `sw_vers` BuildVersion more closely in certain situations, like
     * macOS rapid security response builds.
     * Example: "22F770820d".
     *
     * @generated from protobuf field: string os_build_supplemental = 8;
     */
    osBuildSupplemental: string;
    /**
     * OS identifier.
     * Mainly used to differentiate Linux distros, as there is be no variation
     * for systems like macOS or Windows.
     * Example: "ubuntu", "centos", "fedora", "rhel".
     *
     * @generated from protobuf field: string os_id = 9;
     */
    osId: string;
}
// @generated message type with reflection information, may provide speed optimized methods
class DeviceProfile$Type extends MessageType<DeviceProfile> {
    constructor() {
        super("teleport.devicetrust.v1.DeviceProfile", [
            { no: 1, name: "update_time", kind: "message", T: () => Timestamp },
            { no: 2, name: "model_identifier", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "os_version", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 4, name: "os_build", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 5, name: "os_usernames", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 6, name: "jamf_binary_version", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 7, name: "external_id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 8, name: "os_build_supplemental", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 9, name: "os_id", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<DeviceProfile>): DeviceProfile {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.modelIdentifier = "";
        message.osVersion = "";
        message.osBuild = "";
        message.osUsernames = [];
        message.jamfBinaryVersion = "";
        message.externalId = "";
        message.osBuildSupplemental = "";
        message.osId = "";
        if (value !== undefined)
            reflectionMergePartial<DeviceProfile>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: DeviceProfile): DeviceProfile {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* google.protobuf.Timestamp update_time */ 1:
                    message.updateTime = Timestamp.internalBinaryRead(reader, reader.uint32(), options, message.updateTime);
                    break;
                case /* string model_identifier */ 2:
                    message.modelIdentifier = reader.string();
                    break;
                case /* string os_version */ 3:
                    message.osVersion = reader.string();
                    break;
                case /* string os_build */ 4:
                    message.osBuild = reader.string();
                    break;
                case /* repeated string os_usernames */ 5:
                    message.osUsernames.push(reader.string());
                    break;
                case /* string jamf_binary_version */ 6:
                    message.jamfBinaryVersion = reader.string();
                    break;
                case /* string external_id */ 7:
                    message.externalId = reader.string();
                    break;
                case /* string os_build_supplemental */ 8:
                    message.osBuildSupplemental = reader.string();
                    break;
                case /* string os_id */ 9:
                    message.osId = reader.string();
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
    internalBinaryWrite(message: DeviceProfile, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* google.protobuf.Timestamp update_time = 1; */
        if (message.updateTime)
            Timestamp.internalBinaryWrite(message.updateTime, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        /* string model_identifier = 2; */
        if (message.modelIdentifier !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.modelIdentifier);
        /* string os_version = 3; */
        if (message.osVersion !== "")
            writer.tag(3, WireType.LengthDelimited).string(message.osVersion);
        /* string os_build = 4; */
        if (message.osBuild !== "")
            writer.tag(4, WireType.LengthDelimited).string(message.osBuild);
        /* repeated string os_usernames = 5; */
        for (let i = 0; i < message.osUsernames.length; i++)
            writer.tag(5, WireType.LengthDelimited).string(message.osUsernames[i]);
        /* string jamf_binary_version = 6; */
        if (message.jamfBinaryVersion !== "")
            writer.tag(6, WireType.LengthDelimited).string(message.jamfBinaryVersion);
        /* string external_id = 7; */
        if (message.externalId !== "")
            writer.tag(7, WireType.LengthDelimited).string(message.externalId);
        /* string os_build_supplemental = 8; */
        if (message.osBuildSupplemental !== "")
            writer.tag(8, WireType.LengthDelimited).string(message.osBuildSupplemental);
        /* string os_id = 9; */
        if (message.osId !== "")
            writer.tag(9, WireType.LengthDelimited).string(message.osId);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message teleport.devicetrust.v1.DeviceProfile
 */
export const DeviceProfile = new DeviceProfile$Type();
