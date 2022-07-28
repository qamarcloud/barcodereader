import React, { Component, useEffect } from 'react';
import { Text } from 'react-native';
import {Camera} from 'react-native-vision-camera';
import App from './App';

function Home(){

  const checkCameraPermission = async () => {
    let status = await Camera.getCameraPermissionStatus();
    if (status !== 'authorized') {
      await Camera.requestCameraPermission();
      status = await Camera.getCameraPermissionStatus();
      if (status === 'denied') {
        showToast(
          'You will not be able to scan if you do not allow camera access',
        );
      }else{
        "YOU can SCAN FINE.."
      }
    }
  };

  useEffect(() => {
    checkCameraPermission();
 }, []);
 

    return (
       <>
      {/* <Text>I am your cat</Text> */}
      <App/>
      </>
    );

}

export default Home;