// if you need variables outside the functions, define them above

/** 
@param measurement THREE.Vector3
@param params Object containing all parameter values visible in the GUI
*/

let counter = 0;
let historical_measurements = new Array(200);
export function updateMovingAverage(measurement, params) {
  //console.log(measurement);
  //s_t = (w`_t + w`_<t-1> + ... + w`_<t-k>)/k where t>=k
  //store a specific number of measurements as samples
  historical_measurements[counter] = measurement;
  counter = (counter+1)%params.Samples;
  
  let sumX = 0;
  let sumY = 0;
  let sumZ = 0;
  for (let i = 0; i < params.Samples; i++) {
      if (historical_measurements[i] !== undefined) {
          sumX += historical_measurements[i].x;
          sumY += historical_measurements[i].y;
          sumZ += historical_measurements[i].z;
      }
  }
  const averageX = sumX / params.Samples;
  const averageY = sumY / params.Samples;
  const averageZ = sumZ / params.Samples;
  const average = new THREE.Vector3(averageX, averageY, averageZ);
  return average;
}

let previousMeasurement = new THREE.Vector3(0,0,0); //very first time, there's no previous measurement
export function updateSingleExponential(measurement, params) {
  // s_t = alpha*w`_t + (1-alpha)*s_<t-1>
  let curX = (params.SEAlpha*measurement.x)+previousMeasurement.x*(1-params.SEAlpha);
  let curY = (params.SEAlpha*measurement.y)+previousMeasurement.y*(1-params.SEAlpha);
  let curZ = (params.SEAlpha*measurement.z)+previousMeasurement.z*(1-params.SEAlpha);
  let currentMeasurement = new THREE.Vector3(curX, curY, curZ);
  previousMeasurement = currentMeasurement;
  return currentMeasurement;
}

let prevMeasurement, prevDerivative;
let count = 0;
export function updateDoubleExponential(measurement, params) {
  // s_0 = w`_0; d_0 = w`_1 - w`_0;
  // s_t = alpha*w`_t + (1-alpha)*(s_<t-1> + d_<t-1>)
  // d_t = beta*(s_t - s_<t-1>) + (1-beta)d_<t-1>
  let currentMeasurement = new THREE.Vector3(0,0,0);
  if(count == 0){
    prevMeasurement = new THREE.Vector3(measurement.x, measurement.y, measurement.z);
    currentMeasurement = measurement;
    count++;
  }else if(count == 1){
    prevDerivative = new THREE.Vector3(measurement.x-prevMeasurement.x, measurement.y-prevMeasurement.y, measurement.z-prevMeasurement.z);
    currentMeasurement = measurement;
    count++;
  }else{
    let sumPrevVectors = new THREE.Vector3(0,0,0);
    sumPrevVectors.addVectors(prevMeasurement, prevDerivative);
    currentMeasurement.addVectors(measurement.multiplyScalar(params.DEAlpha),sumPrevVectors.multiplyScalar((1-params.DEAlpha)));
    let diffVectors = new THREE.Vector3(0,0,0);
    let negativePrevMeasurement = prevMeasurement.multiplyScalar(-1);
    diffVectors.addVectors(currentMeasurement, negativePrevMeasurement);
    //console.log('here');
    let currentDerivative = new THREE.Vector3(0,0,0);
    currentDerivative.addVectors(diffVectors.multiplyScalar(params.DEBeta), prevDerivative.multiplyScalar(1-params.DEBeta));

    prevMeasurement = currentMeasurement;
    prevDerivative = currentDerivative;
  }
  return currentMeasurement;
}

// optional task
//used https://github.com/casiez/OneEuroFilter/blob/main/javascript/OneEuroFilter.js as reference
export function updateOneEuro(measurement, params) {
  // TODO replace this with your implementation
  console.warn("Not implemented");
  return measurement;
}