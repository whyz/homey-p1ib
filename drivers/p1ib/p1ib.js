'use strict';

// eslint-disable-next-line node/no-unsupported-features/es-syntax

const got = require('got');

class P1ibConnector {

  address = '';

  constructor(address) {
    this.address = address;
  }

  getValueFromMeterData(meterData, obis) {
    // for newer p1ib firmware versions
    if (obis in meterData['d']) {
      return meterData['d'][obis][9];
    }

    // for older p1ib firmware versions
    for (const group in meterData['d']) {
      if (obis in meterData['d'][group]['obis']) {
        return meterData['d'][group]['obis'][obis]['v'][9];
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

    const momentaryPowerImportObis = '1-0:1.7.0';
    const momentaryPowerExportObis = '1-0:2.7.0';

    const activeEnergyImportObis = '1-0:1.8.0';
    const activeEnergyExportObis = '1-0:2.8.0';

    const voltageL1Obis = '1-0:32.7.0';
    const voltageL2Obis = '1-0:52.7.0';
    const voltageL3Obis = '1-0:72.7.0';

    const currentL1Obis = '1-0:31.7.0';
    const currentL2Obis = '1-0:51.7.0';
    const currentL3Obis = '1-0:71.7.0';

    const powerImportL1Obis = '1-0:21.7.0';
    const powerImportL2Obis = '1-0:41.7.0';
    const powerImportL3Obis = '1-0:61.7.0';
    const powerExportL1Obis = '1-0:22.7.0';
    const powerExportL2Obis = '1-0:42.7.0';
    const powerExportL3Obis = '1-0:62.7.0';

    const momentaryPowerImport = this.getValueFromMeterData(meterData, momentaryPowerImportObis) * 1000;
    const momentaryPowerExport = this.getValueFromMeterData(meterData, momentaryPowerExportObis) * 1000;

    const activeEnergyImport = this.getValueFromMeterData(meterData, activeEnergyImportObis);
    const activeEnergyExport = this.getValueFromMeterData(meterData, activeEnergyExportObis);

    const currentL1 = this.getValueFromMeterData(meterData, currentL1Obis);
    const currentL2 = this.getValueFromMeterData(meterData, currentL2Obis);
    const currentL3 = this.getValueFromMeterData(meterData, currentL3Obis);

    const voltageL1 = this.getValueFromMeterData(meterData, voltageL1Obis);
    const voltageL2 = this.getValueFromMeterData(meterData, voltageL2Obis);
    const voltageL3 = this.getValueFromMeterData(meterData, voltageL3Obis);

    const powerImportL1 = this.getValueFromMeterData(meterData, powerImportL1Obis) * 1000;
    const powerImportL2 = this.getValueFromMeterData(meterData, powerImportL2Obis) * 1000;
    const powerImportL3 = this.getValueFromMeterData(meterData, powerImportL3Obis) * 1000;

    const powerExportL1 = this.getValueFromMeterData(meterData, powerExportL1Obis) * 1000;
    const powerExportL2 = this.getValueFromMeterData(meterData, powerExportL2Obis) * 1000;
    const powerExportL3 = this.getValueFromMeterData(meterData, powerExportL3Obis) * 1000;

    const powerL1 = powerImportL1 - powerExportL1;
    const powerL2 = powerImportL2 - powerExportL2;
    const powerL3 = powerImportL3 - powerExportL3;

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
      momentaryPowerImport,
      momentaryPowerExport,
      activeEnergyImport,
      activeEnergyExport
    };

    return retval;
  }

}

module.exports = P1ibConnector;
