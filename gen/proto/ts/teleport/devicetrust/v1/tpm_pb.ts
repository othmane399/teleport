/* eslint-disable */
// @generated by protobuf-ts 2.9.3 with parameter long_type_number,eslint_disable,add_pb_suffix,ts_nocheck
// @generated from protobuf file "teleport/devicetrust/v1/tpm.proto" (package "teleport.devicetrust.v1", syntax proto3)
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
 * Encapsulates the value of a PCR at a point at time.
 * See https://pkg.go.dev/github.com/google/go-attestation/attest#PCR
 *
 * @generated from protobuf message teleport.devicetrust.v1.TPMPCR
 */
export interface TPMPCR {
    /**
     * the PCR index in the PCR bank
     *
     * @generated from protobuf field: int32 index = 1;
     */
    index: number;
    /**
     * the digest currently held in the PCR
     *
     * @generated from protobuf field: bytes digest = 2;
     */
    digest: Uint8Array;
    /**
     * the hash algorithm used to produce the digest in this PCR bank. This value
     * is the underlying value of the Go crypto.Hash type.
     *
     * @generated from protobuf field: uint64 digest_alg = 3;
     */
    digestAlg: number;
}
/**
 * Encapsulates the result of a quote operation against the TPM over a PCR
 * using an attestation key.
 * See https://pkg.go.dev/github.com/google/go-attestation/attest#Quote
 *
 * @generated from protobuf message teleport.devicetrust.v1.TPMQuote
 */
export interface TPMQuote {
    /**
     * @generated from protobuf field: bytes quote = 1;
     */
    quote: Uint8Array;
    /**
     * @generated from protobuf field: bytes signature = 2;
     */
    signature: Uint8Array;
}
/**
 * The quotes, PCRs and event log from a TPM that attest to the booted state
 * of the machine.
 * See https://pkg.go.dev/github.com/google/go-attestation/attest#PlatformParameters
 * Excludes TPMVersion and Public since these are already known values.
 *
 * @generated from protobuf message teleport.devicetrust.v1.TPMPlatformParameters
 */
export interface TPMPlatformParameters {
    /**
     * @generated from protobuf field: repeated teleport.devicetrust.v1.TPMQuote quotes = 1;
     */
    quotes: TPMQuote[];
    /**
     * @generated from protobuf field: repeated teleport.devicetrust.v1.TPMPCR pcrs = 2;
     */
    pcrs: TPMPCR[];
    /**
     * @generated from protobuf field: bytes event_log = 3;
     */
    eventLog: Uint8Array;
}
/**
 * Holds the record of a TPM platform attestation, including the platform
 * parameters sent by the device and the nonce the server generated. This allows
 * a historical platform attestation to be revalidated and allows us to compare
 * the incoming state of a device (e.g during authentication) against the
 * historical state in order to detect potentially malicious actions.
 *
 * @generated from protobuf message teleport.devicetrust.v1.TPMPlatformAttestation
 */
export interface TPMPlatformAttestation {
    /**
     * @generated from protobuf field: bytes nonce = 1;
     */
    nonce: Uint8Array;
    /**
     * @generated from protobuf field: teleport.devicetrust.v1.TPMPlatformParameters platform_parameters = 2;
     */
    platformParameters?: TPMPlatformParameters;
}
// @generated message type with reflection information, may provide speed optimized methods
class TPMPCR$Type extends MessageType<TPMPCR> {
    constructor() {
        super("teleport.devicetrust.v1.TPMPCR", [
            { no: 1, name: "index", kind: "scalar", T: 5 /*ScalarType.INT32*/ },
            { no: 2, name: "digest", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 3, name: "digest_alg", kind: "scalar", T: 4 /*ScalarType.UINT64*/, L: 2 /*LongType.NUMBER*/ }
        ]);
    }
    create(value?: PartialMessage<TPMPCR>): TPMPCR {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.index = 0;
        message.digest = new Uint8Array(0);
        message.digestAlg = 0;
        if (value !== undefined)
            reflectionMergePartial<TPMPCR>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: TPMPCR): TPMPCR {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* int32 index */ 1:
                    message.index = reader.int32();
                    break;
                case /* bytes digest */ 2:
                    message.digest = reader.bytes();
                    break;
                case /* uint64 digest_alg */ 3:
                    message.digestAlg = reader.uint64().toNumber();
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
    internalBinaryWrite(message: TPMPCR, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* int32 index = 1; */
        if (message.index !== 0)
            writer.tag(1, WireType.Varint).int32(message.index);
        /* bytes digest = 2; */
        if (message.digest.length)
            writer.tag(2, WireType.LengthDelimited).bytes(message.digest);
        /* uint64 digest_alg = 3; */
        if (message.digestAlg !== 0)
            writer.tag(3, WireType.Varint).uint64(message.digestAlg);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message teleport.devicetrust.v1.TPMPCR
 */
export const TPMPCR = new TPMPCR$Type();
// @generated message type with reflection information, may provide speed optimized methods
class TPMQuote$Type extends MessageType<TPMQuote> {
    constructor() {
        super("teleport.devicetrust.v1.TPMQuote", [
            { no: 1, name: "quote", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 2, name: "signature", kind: "scalar", T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
    create(value?: PartialMessage<TPMQuote>): TPMQuote {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.quote = new Uint8Array(0);
        message.signature = new Uint8Array(0);
        if (value !== undefined)
            reflectionMergePartial<TPMQuote>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: TPMQuote): TPMQuote {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* bytes quote */ 1:
                    message.quote = reader.bytes();
                    break;
                case /* bytes signature */ 2:
                    message.signature = reader.bytes();
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
    internalBinaryWrite(message: TPMQuote, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* bytes quote = 1; */
        if (message.quote.length)
            writer.tag(1, WireType.LengthDelimited).bytes(message.quote);
        /* bytes signature = 2; */
        if (message.signature.length)
            writer.tag(2, WireType.LengthDelimited).bytes(message.signature);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message teleport.devicetrust.v1.TPMQuote
 */
export const TPMQuote = new TPMQuote$Type();
// @generated message type with reflection information, may provide speed optimized methods
class TPMPlatformParameters$Type extends MessageType<TPMPlatformParameters> {
    constructor() {
        super("teleport.devicetrust.v1.TPMPlatformParameters", [
            { no: 1, name: "quotes", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => TPMQuote },
            { no: 2, name: "pcrs", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => TPMPCR },
            { no: 3, name: "event_log", kind: "scalar", T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
    create(value?: PartialMessage<TPMPlatformParameters>): TPMPlatformParameters {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.quotes = [];
        message.pcrs = [];
        message.eventLog = new Uint8Array(0);
        if (value !== undefined)
            reflectionMergePartial<TPMPlatformParameters>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: TPMPlatformParameters): TPMPlatformParameters {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* repeated teleport.devicetrust.v1.TPMQuote quotes */ 1:
                    message.quotes.push(TPMQuote.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                case /* repeated teleport.devicetrust.v1.TPMPCR pcrs */ 2:
                    message.pcrs.push(TPMPCR.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                case /* bytes event_log */ 3:
                    message.eventLog = reader.bytes();
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
    internalBinaryWrite(message: TPMPlatformParameters, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* repeated teleport.devicetrust.v1.TPMQuote quotes = 1; */
        for (let i = 0; i < message.quotes.length; i++)
            TPMQuote.internalBinaryWrite(message.quotes[i], writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        /* repeated teleport.devicetrust.v1.TPMPCR pcrs = 2; */
        for (let i = 0; i < message.pcrs.length; i++)
            TPMPCR.internalBinaryWrite(message.pcrs[i], writer.tag(2, WireType.LengthDelimited).fork(), options).join();
        /* bytes event_log = 3; */
        if (message.eventLog.length)
            writer.tag(3, WireType.LengthDelimited).bytes(message.eventLog);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message teleport.devicetrust.v1.TPMPlatformParameters
 */
export const TPMPlatformParameters = new TPMPlatformParameters$Type();
// @generated message type with reflection information, may provide speed optimized methods
class TPMPlatformAttestation$Type extends MessageType<TPMPlatformAttestation> {
    constructor() {
        super("teleport.devicetrust.v1.TPMPlatformAttestation", [
            { no: 1, name: "nonce", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 2, name: "platform_parameters", kind: "message", T: () => TPMPlatformParameters }
        ]);
    }
    create(value?: PartialMessage<TPMPlatformAttestation>): TPMPlatformAttestation {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.nonce = new Uint8Array(0);
        if (value !== undefined)
            reflectionMergePartial<TPMPlatformAttestation>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: TPMPlatformAttestation): TPMPlatformAttestation {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* bytes nonce */ 1:
                    message.nonce = reader.bytes();
                    break;
                case /* teleport.devicetrust.v1.TPMPlatformParameters platform_parameters */ 2:
                    message.platformParameters = TPMPlatformParameters.internalBinaryRead(reader, reader.uint32(), options, message.platformParameters);
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
    internalBinaryWrite(message: TPMPlatformAttestation, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* bytes nonce = 1; */
        if (message.nonce.length)
            writer.tag(1, WireType.LengthDelimited).bytes(message.nonce);
        /* teleport.devicetrust.v1.TPMPlatformParameters platform_parameters = 2; */
        if (message.platformParameters)
            TPMPlatformParameters.internalBinaryWrite(message.platformParameters, writer.tag(2, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message teleport.devicetrust.v1.TPMPlatformAttestation
 */
export const TPMPlatformAttestation = new TPMPlatformAttestation$Type();
