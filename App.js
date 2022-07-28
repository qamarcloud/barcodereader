import 'react-native-reanimated'
import { StyleSheet , SafeAreaView, Text, Dimensions, Platform} from 'react-native';
import React, { memo, useEffect, useState } from 'react';
import { Camera, useCameraDevices, useFrameProcessor } from 'react-native-vision-camera';
import { BarcodeFormat, scanBarcodes, Barcode, useScanBarcodes } from 'vision-camera-code-scanner';
import * as REA from 'react-native-reanimated';
//import { runOnJS } from 'react-native-reanimated'
import {RNHoleView} from 'react-native-hole-view';
import { Polygon, Svg } from 'react-native-svg';

export default function App() {
  const devices = useCameraDevices();
  const device = devices.back;



  const [barcodes, setBarcodes] = React.useState('');
  const [hasPermission, setHasPermission] = React.useState(false);
  const [isScanned, setIsScanned] = React.useState(false);
  const [frameWidth, setFrameWidth] = React.useState(720);
  const [frameHeight, setFrameHeight] = React.useState(1280);
  
  // const [frameProcessor, barcodes] = useScanBarcodes([
  //   [BarcodeFormat.ALL_FORMATS],
  //   { checkInverted: true } // You can only specify a particular format
  //   ]);

 const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    const detectedBarcodes = scanBarcodes(frame, [BarcodeFormat.ALL_FORMATS], { checkInverted: true });
    //console.log("frame in frameProcessor",frame);
    console.log("detectedBarcodes.....",detectedBarcodes); 
    REA.runOnJS(setBarcodes)(detectedBarcodes);
    REA.runOnJS(setFrameWidth)(frame.width);
    REA.runOnJS(setFrameHeight)(frame.height);
  }, []);

  //console.log("Frame Processor", frameProcessor);
  
  React.useEffect(() => {
      checkCameraPermission();
    }, []);
  
   const checkCameraPermission = async () => {
      const status = await Camera.getCameraPermissionStatus();
      setHasPermission(status === 'authorized');
   };
 
   const getPointsData = (lr) => {
    var pointsData = lr.x1 + "," + lr.y1 + " ";
    pointsData = pointsData+lr.x2 + "," + lr.y2 +" ";
    pointsData = pointsData+lr.x3 + "," + lr.y3 +" ";
    pointsData = pointsData+lr.x4 + "," + lr.y4;
    return pointsData;
  }

  const getPointsData2 = (barcode) => {
    let lr= barcode.cornerPoints
    let pointsData = lr[0].x + "," + lr[0].y + " ";
    pointsData = pointsData+lr[1].x + "," + lr[1].y +" ";
    pointsData = pointsData+lr[2].x + "," + lr[2].y +" ";
    pointsData = pointsData+lr[3].x + "," + lr[3].y;
    return pointsData;
  }

  const getViewBox = () => {
    const frameSize = getFrameSize();
    const viewBox = "0 0 "+frameSize[0]+" "+frameSize[1];
    //console.log("viewBox"+viewBox);
    return viewBox;
  }

  const getFrameSize = () => {
    let width, height;
    if (Platform.OS === 'android') {
      if (frameWidth>frameHeight && Dimensions.get('window').width>Dimensions.get('window').height){
        width = frameWidth;
        height = frameHeight;
      }else {
        //console.log("Has rotation");
        width = frameHeight;
        height = frameWidth;
      }
    } else {
      width = frameWidth;
      height = frameHeight;
    }
    return [width, height];
  } 
    //console.log("Has Permission",hasPermission)
  
  return(
    <SafeAreaView style={styles.container}>
    {device != null &&
      hasPermission && (
        <>
         
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={!isScanned}
            frameProcessor={frameProcessor}
            frameProcessorFps={5}
            audio={false}
          />
          {barcodes && barcodes.map((barcode, idx) => (
            <Text key={idx} style={styles.barcodeText}>
                {"BARCODE" +": "+ barcode.rawValue}
            </Text>
            ))}
         <RNHoleView
              holes={[
                {
                  x: 30,
                  y: 50,
                  width: 350,
                  height: 600,
                  borderRadius: 10,
                },
              ]}
              style={styles.rnholeView}
            />
        </>
      )}
      <Svg style={[StyleSheet.absoluteFill]} viewBox={getViewBox()}>

      {barcodes && barcodes.map((barcode, idx) => (
        <Polygon key={idx}
        points={getPointsData2(barcode)}
        fill="lime"
        stroke="green"
        opacity="0.5"
        strokeWidth="1"
      />
      ))}
      
    </Svg>
     </SafeAreaView>
  );
}

// Styles:
const styles = StyleSheet.create({
  rnholeView: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    flex:1
  },
  barcodeText: {
    fontSize: 20,
    color: 'lime',
    fontWeight: 'bold',
  },
});
