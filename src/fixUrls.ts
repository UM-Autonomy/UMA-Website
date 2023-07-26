import { KhronosTextureContainer2 } from '@babylonjs/core/Misc/khronosTextureContainer2';
import jsDecoderModule from 'babylonjs-ktx2decoder/babylon.ktx2Decoder.js?url';
import msc_basis_transcoderJs from './msc_basis_transcoder.js?url';
import msc_basis_transcoderWasm from './msc_basis_transcoder.wasm?url';

import { MeshoptCompression } from '@babylonjs/core/Meshes/Compression/meshoptCompression';
import meshoptDe from 'meshoptimizer/meshopt_decoder.js?url';

KhronosTextureContainer2.URLConfig.jsDecoderModule = jsDecoderModule;
KhronosTextureContainer2.URLConfig.jsMSCTranscoder = msc_basis_transcoderJs;
KhronosTextureContainer2.URLConfig.wasmMSCTranscoder = msc_basis_transcoderWasm;
MeshoptCompression.Configuration.decoder.url = meshoptDe;
console.log(KhronosTextureContainer2.URLConfig, KhronosTextureContainer2);
