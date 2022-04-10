'use strict';

const Homey = require('homey');

class P1ibApp extends Homey.App {

  async onInit() {
    this.log('p1ib app has been initialized');
  }

}

module.exports = P1ibApp;
