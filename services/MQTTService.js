const mqtt = require('mqtt');

class MQTTService {
  constructor() {
    this.connected = false;
    this.client = null;
  }

  isConnected() {
    return this.connected;
  };

  connect() {
    this.client  = mqtt.connect('tcp://iot.eclipse.org', {
      keepalive: 36000,
    });
    this.client.on('connect', () => {
      console.log('connected to broker');
      this.connected= true;
    });
  }

  getClient() {
    return this.client;
  }
}

const mqttService = new MQTTService();

module.exports = mqttService;