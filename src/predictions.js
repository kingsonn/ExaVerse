import 'regenerator-runtime/runtime'
import * as params from './pose-detection-cfg';
import * as tf from '@tensorflow/tfjs-core';
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';
import * as poseDetection from '@tensorflow-models/pose-detection';


let poseDetector;
const setupTf = async () => {
    // setup AI
    await tf.setBackend(params.PoseDetectionCfg.backend)
    console.log(`tfjs backend is ${tf.getBackend()}`)
    console.log(`wasm thread count ${tfjsWasm.getThreadsCount()}`)

    poseDetector = await poseDetection.createDetector(
        params.PoseDetectionCfg.model,
        params.PoseDetectionCfg.modelConfig);
    console.log('poseDetector created')
}

setupTf()


const predict = async (imgData) => {
    // pose detection
    let poses;
    try {
        poses = await poseDetector.estimatePoses(
            imgData,
            {
                maxPoses: 1,
            }
        )
    } catch (error) {
        poseDetector.dispose();
        poseDetector = null;
        alert(error);
    }
    return poses
}

export { predict }
