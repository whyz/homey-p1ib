'use strict';

const { Device } = require('homey');
const P1ibConnector = require('./p1ib');

class P1ibDevice extends Device {

  async onInit() {
    this.log('p1ib has been initialized');

    const settings = this.getSettings();
    this.log('p1ib address:', settings.p1ib_address);

    this.p1ibConnector = new P1ibConnector(settings.p1ib_address);
    await this.update();

    this.pollTimeout = this.homey.setInterval(async () => {
      await this.update();
    }, 10000);
  }

  async update() {
    try {
      if (!this.p1ibConnector.address) {
        this.log('No address has been set - skipping update');
        return;
      }

      const meterData = await this.p1ibConnector.readMeterData();
      this.log(meterData);

      const power = meterData.momentaryPowerImport - meterData.momentaryPowerExport;
      this.setCapabilityValue('measure_power', power).catch(this.error);
      this.setCapabilityValue('measure_power.export', meterData.momentaryPowerExport).catch(this.error);
      this.setCapabilityValue('measure_power.import', meterData.momentaryPowerImport).catch(this.error);

      this.setCapabilityValue('meter_power', meterData.activeImport).catch(this.error);
      this.setCapabilityValue('meter_power.export', meterData.activeExport).catch(this.error);

      this.setCapabilityValue('measure_current.l1', meterData.currentL1).catch(this.error);
      this.setCapabilityValue('measure_current.l2', meterData.currentL2).catch(this.error);
      this.setCapabilityValue('measure_current.l3', meterData.currentL3).catch(this.error);

      this.setCapabilityValue('measure_voltage.l1', meterData.voltageL1).catch(this.error);
      this.setCapabilityValue('measure_voltage.l2', meterData.voltageL2).catch(this.error);
      this.setCapabilityValue('measure_voltage.l3', meterData.voltageL3).catch(this.error);

      this.setCapabilityValue('measure_power.l1', meterData.powerL1).catch(this.error);
      this.setCapabilityValue('measure_power.l2', meterData.powerL2).catch(this.error);
      this.setCapabilityValue('measure_power.l3', meterData.powerL3).catch(this.error);

      this.setAvailable().catch(this.error);
    } catch (error) {
      this.error('error:', error);
      this.setUnavailable().catch(this.error);
    }
  }

  async onAdded() {
    this.log('p1ib has been added');
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    this.log('p1ib settings were changed');
    this.p1ibConnector.address = newSettings.p1ib_address;
  }

  async onRenamed(name) {
    this.log('p1ib was renamed');
  }

  async onDeleted() {
    this.log('p1ib has been deleted');
    this.homey.clearInterval(this.pollTimeout);
  }

  onDiscoveryResult(discoveryResult) {
    // Return a truthy value here if the discovery result matches your device.

    this.log('onDiscoveryResult:', discoveryResult);

    return discoveryResult.id === this.getData().id;
  }

  async onDiscoveryAvailable(discoveryResult) {
    this.log('onDiscoveryAvailable:', discoveryResult);

    const p1ibAddress = `${discoveryResult.address}:${discoveryResult.port}`;

    await this.setSettings({
      p1ib_address: p1ibAddress,
    });

    this.p1ibConnector.address = p1ibAddress;
  }

  async onDiscoveryAddressChanged(discoveryResult) {
    this.log('onDiscoveryAddressChanged');

    const p1ibAddress = `${discoveryResult.address}:${discoveryResult.port}`;

    await this.setSettings({
      p1ib_address: p1ibAddress,
    });

    this.p1ibConnector.address = p1ibAddress;
  }

  onDiscoveryLastSeenChanged(discoveryResult) {
    this.log('onDiscoveryLastSeenChanged');
  }

}

module.exports = P1ibDevice;
