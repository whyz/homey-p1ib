'use strict';

const { Driver } = require('homey');
const P1ibConnector = require('./p1ib');

class P1ibDriver extends Driver {

  async onInit() {
    this.log('p1ib driver has been initialized');

    const discoveryStrategy = this.getDiscoveryStrategy();
    console.log('strategy:', discoveryStrategy);

    const initialDiscoveryResults = discoveryStrategy.getDiscoveryResults();

    for (const discoveryResult of Object.values(initialDiscoveryResults)) {
      console.log('initial:', discoveryResult);
      this.handleDiscoveryResult(discoveryResult);
    }

    discoveryStrategy.on('result', discoveryResult => {
      console.log('got discovery result:', discoveryResult);
      this.handleDiscoveryResult(discoveryResult);
    });
  }

  handleDiscoveryResult(discoveryResult) {
    const device = {
      name: discoveryResult.txt.name,
      data: {
        id: discoveryResult.txt.id,
      },
      settings: {
        p1ib_address: `${discoveryResult.address}:${discoveryResult.port}`,
      },
    };

    this.discoveryResult = device;

    console.log('stored discoveryresult:', this.discoveryResult);
  }

  async onPair(session) {
    console.log('onPair');

    session.setHandler('showView', async (viewId) => {
      console.log('View:', viewId);
    });

    session.setHandler('test_connection', async (data) => {
      console.log('test connection:', data.p1ibAddress);

      try {
        const p1ibConnector = new P1ibConnector(data.p1ibAddress);
        const deviceInfo = await p1ibConnector.getDeviceInfo();
        return deviceInfo;
      } catch (error) {
        console.error(error);
        return 'ERROR';
      }
    });

    // called by list_devices view template
    session.setHandler('list_devices', async (data) => {
      console.log('list_devices called');

      if (this.discoveryResult) {
        console.log('discoveryResult found', this.discoveryResult);
        return [this.discoveryResult];
      }
      console.log('no devices found - going to manual add view');
      await session.showView('manual_add_view');
      return [];
    });
  }

}

module.exports = P1ibDriver;
