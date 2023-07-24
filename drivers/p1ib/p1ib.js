'use strict';

// eslint-disable-next-line node/no-unsupported-features/es-syntax

const got = require('got');

class P1ibConnector {

  address = '';

  constructor(address) {
    this.address = address;
  }

  getValueFromMeterData(meterData, obis) {
    for (const group in meterData['d']) {
      if (obis in meterData['d'][group]['obis']) {
        return meterData['d'][group]['obis'][obis]['v'][9]; // most recent value in the array
      }
    }
    return 0;
  }

  async getDeviceInfo() {
    const url = `http://${this.address}/deviceInfo`;
    const response = await got(url);
    const deviceInfo = JSON.parse(response.body);
    return deviceInfo;
  }

  async readMeterData() {
    const url = `http://${this.address}/meterData`;
    console.log('fetching data from:', url);

    let responseBody = '';

    try {
      const response = await got(url);
      responseBody = response.body;
    } catch (error) {
      console.error('Error caught while getting meterData', error);
    }

    const meterData = JSON.parse(responseBody);

    if (meterData == null) {
      console.error(`Unable to parse meterData json from body: ${responseBody}`);
    }

    const momentaryPowerImportObis = '1.0.1.7.0.255';
    const momentaryPowerExportObis = '1.0.2.7.0.255';

    const activeImportObis = '1.0.1.8.0.255';
    const activeExportObis = '1.0.2.8.0.255';

    const voltageL1Obis = '1.0.32.7.0.255';
    const voltageL2Obis = '1.0.52.7.0.255';
    const voltageL3Obis = '1.0.72.7.0.255';

    const currentL1Obis = '1.0.31.7.0.255';
    const currentL2Obis = '1.0.51.7.0.255';
    const currentL3Obis = '1.0.71.7.0.255';

    const powerL1Obis = '1.0.21.7.0.255';
    const powerL2Obis = '1.0.41.7.0.255';
    const powerL3Obis = '1.0.61.7.0.255';

    const momentaryPowerImport = this.getValueFromMeterData(meterData, momentaryPowerImportObis) * 1000;
    const momentaryPowerExport = this.getValueFromMeterData(meterData, momentaryPowerExportObis) * 1000;

    const activeImport = this.getValueFromMeterData(meterData, activeImportObis);
    const activeExport = this.getValueFromMeterData(meterData, activeExportObis);

    const currentL1 = this.getValueFromMeterData(meterData, currentL1Obis);
    const currentL2 = this.getValueFromMeterData(meterData, currentL2Obis);
    const currentL3 = this.getValueFromMeterData(meterData, currentL3Obis);

    const totalCurrent = currentL1 + currentL2 + currentL3;

    const voltageL1 = this.getValueFromMeterData(meterData, voltageL1Obis);
    const voltageL2 = this.getValueFromMeterData(meterData, voltageL2Obis);
    const voltageL3 = this.getValueFromMeterData(meterData, voltageL3Obis);

    const powerL1 = this.getValueFromMeterData(meterData, powerL1Obis) * 1000;
    const powerL2 = this.getValueFromMeterData(meterData, powerL2Obis) * 1000;
    const powerL3 = this.getValueFromMeterData(meterData, powerL3Obis) * 1000;

    const meanVoltage = (voltageL1 + voltageL2 + voltageL3) / 3;

    const retval = {
      voltageL1,
      voltageL2,
      voltageL3,
      currentL1,
      currentL2,
      currentL3,
      powerL1,
      powerL2,
      powerL3,
      voltage: meanVoltage,
      current: totalCurrent,
      momentaryPowerImport,
      momentaryPowerExport,
      activeImport,
      activeExport
    };

    return retval;
  }

}

module.exports = P1ibConnector;
