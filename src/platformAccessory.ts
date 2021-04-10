/* eslint-disable max-len */
import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { NADHomebridgePlatform } from './platform';

import { Telnet } from 'telnet-rxjs';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different power types.
 */
export class NADPlatformAccessory {
  private power: Service;
  private speaker: Service;
  private input1: Service | undefined;
  private input2: Service | undefined;
  private input3: Service | undefined;
  private input4: Service | undefined;
  private input5: Service | undefined;
  private input6: Service | undefined;
  private input7: Service | undefined;
  private input8: Service | undefined;
  private input9: Service | undefined;
  private inputs = this.platform.config.inputs || [];

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private NADStates = {
    On: false,
    Mute: false,
    Volume : 0,
    SelectedInput: 1,
  };

  private NADConnect = {
    Host: this.platform.config.ip,
    Port: parseInt(this.platform.config.port) || 23,
    Connected: false,
  };

  private client = Telnet.client(this.NADConnect.Host + ':' + this.NADConnect.Port, { rejectUnauthorized: false });

  constructor(
    private readonly platform: NADHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'NAD Electronics')
      .setCharacteristic(this.platform.Characteristic.Model, this.platform.config.model || 'unknown')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.platform.config.serialNumber || 'unknown');

    this.platform.log.debug('Adding power switch service');
    // get the Switch service if it exists, otherwise create a new Switch service
    // you can create multiple services for each accessory
    this.power = this.accessory.getService('Power') || this.accessory.addService(this.platform.Service.Switch, 'Power');

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.power.setCharacteristic(this.platform.Characteristic.Name, (this.platform.config.model || 'NAD') + ' Power');

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Switch

    // register handlers for the On/Off Characteristic
    this.power.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this))
      .onGet(this.getOn.bind(this));

    this.platform.log.debug('Adding speaker service');
    this.speaker = this.accessory.getService('Speakers') || this.accessory.addService(this.platform.Service.Speaker, 'Speakers');
    this.speaker.setCharacteristic(this.platform.Characteristic.Name, (this.platform.config.model || 'NAD') + ' Speakers');
    this.speaker.getCharacteristic(this.platform.Characteristic.Mute)
      .onGet(this.handleMuteGet.bind(this))
      .onSet(this.handleMuteSet.bind(this));

    this.speaker.getCharacteristic(this.platform.Characteristic.Volume)
      .onSet(this.setVolume.bind(this))
      .onGet(this.getVolume.bind(this));

    this.platform.log.debug('configured inputs:', this.platform.config.inputs);
    let inputName = '';

    if (this.inputs.find(i => i.number === 1)) {
      inputName = this.inputs.find(i => i.number === 1).name;
      this.platform.log.debug('Adding input switch service: ', inputName);
      this.input1 = this.accessory.addService(this.platform.Service.Switch, (this.platform.config.model || 'NAD') + ' ' + inputName, 'input1');
      this.input1.setCharacteristic(this.platform.Characteristic.Name, (this.platform.config.model || 'NAD') + ' ' + inputName);
      this.input1.getCharacteristic(this.platform.Characteristic.On)
        .onSet(this.setInput1On.bind(this))
        .onGet(this.getInput1On.bind(this));
    }

    if (this.inputs.find(i => i.number === 2)) {
      inputName = this.inputs.find(i => i.number === 2).name;
      this.platform.log.debug('Adding input switch service: ', inputName);
      this.input2 = this.accessory.addService(this.platform.Service.Switch, (this.platform.config.model || 'NAD') + ' ' + inputName, 'input2');
      this.input2.setCharacteristic(this.platform.Characteristic.Name, (this.platform.config.model || 'NAD') + ' ' + inputName);
      this.input2.getCharacteristic(this.platform.Characteristic.On)
        .onSet(this.setInput2On.bind(this))
        .onGet(this.getInput2On.bind(this));
    }

    if (this.inputs.find(i => i.number === 3)) {
      inputName = this.inputs.find(i => i.number === 3).name;
      this.platform.log.debug('Adding input switch service: ', inputName);
      this.input3 = this.accessory.addService(this.platform.Service.Switch, (this.platform.config.model || 'NAD') + ' ' + inputName, 'input3');
      this.input3.setCharacteristic(this.platform.Characteristic.Name, (this.platform.config.model || 'NAD') + ' ' + inputName);
      this.input3.getCharacteristic(this.platform.Characteristic.On)
        .onSet(this.setInput3On.bind(this))
        .onGet(this.getInput3On.bind(this));
    }

    if (this.inputs.find(i => i.number === 4)) {
      inputName = this.inputs.find(i => i.number === 4).name;
      this.platform.log.debug('Adding input switch service: ', inputName);
      this.input4 = this.accessory.addService(this.platform.Service.Switch, (this.platform.config.model || 'NAD') + ' ' + inputName, 'input4');
      this.input4.setCharacteristic(this.platform.Characteristic.Name, (this.platform.config.model || 'NAD') + ' ' + inputName);
      this.input4.getCharacteristic(this.platform.Characteristic.On)
        .onSet(this.setInput4On.bind(this))
        .onGet(this.getInput4On.bind(this));
    }

    if (this.inputs.find(i => i.number === 5)) {
      inputName = this.inputs.find(i => i.number === 5).name;
      this.platform.log.debug('Adding input switch service: ', inputName);
      this.input5 = this.accessory.addService(this.platform.Service.Switch, (this.platform.config.model || 'NAD') + ' ' + inputName, 'input5');
      this.input5.setCharacteristic(this.platform.Characteristic.Name, (this.platform.config.model || 'NAD') + ' ' + inputName);
      this.input5.getCharacteristic(this.platform.Characteristic.On)
        .onSet(this.setInput5On.bind(this))
        .onGet(this.getInput5On.bind(this));
    }

    if (this.inputs.find(i => i.number === 6)) {
      inputName = this.inputs.find(i => i.number === 6).name;
      this.platform.log.debug('Adding input switch service: ', inputName);
      this.input6 = this.accessory.addService(this.platform.Service.Switch, (this.platform.config.model || 'NAD') + ' ' + inputName, 'input6');
      this.input6.setCharacteristic(this.platform.Characteristic.Name, (this.platform.config.model || 'NAD') + ' ' + inputName);
      this.input6.getCharacteristic(this.platform.Characteristic.On)
        .onSet(this.setInput6On.bind(this))
        .onGet(this.getInput6On.bind(this));
    }

    if (this.inputs.find(i => i.number === 7)) {
      inputName = this.inputs.find(i => i.number === 7).name;
      this.platform.log.debug('Adding input switch service: ', inputName);
      this.input7 = this.accessory.addService(this.platform.Service.Switch, (this.platform.config.model || 'NAD') + ' ' + inputName, 'input7');
      this.input7.setCharacteristic(this.platform.Characteristic.Name, (this.platform.config.model || 'NAD') + ' ' + inputName);
      this.input7.getCharacteristic(this.platform.Characteristic.On)
        .onSet(this.setInput7On.bind(this))
        .onGet(this.getInput7On.bind(this));
    }

    if (this.inputs.find(i => i.number === 8)) {
      inputName = this.inputs.find(i => i.number === 8).name;
      this.platform.log.debug('Adding input switch service: ', inputName);
      this.input8 = this.accessory.addService(this.platform.Service.Switch, (this.platform.config.model || 'NAD') + ' ' + inputName, 'input8');
      this.input8.setCharacteristic(this.platform.Characteristic.Name, (this.platform.config.model || 'NAD') + ' ' + inputName);
      this.input8.getCharacteristic(this.platform.Characteristic.On)
        .onSet(this.setInput8On.bind(this))
        .onGet(this.getInput8On.bind(this));
    }

    if (this.inputs.find(i => i.number === 9)) {
      inputName = this.inputs.find(i => i.number === 9).name;
      this.platform.log.debug('Adding input switch service: ', inputName);
      this.input9 = this.accessory.addService(this.platform.Service.Switch, (this.platform.config.model || 'NAD') + ' ' + inputName, 'input9');
      this.input9.setCharacteristic(this.platform.Characteristic.Name, (this.platform.config.model || 'NAD') + ' ' + inputName);
      this.input9.getCharacteristic(this.platform.Characteristic.On)
        .onSet(this.setInput9On.bind(this))
        .onGet(this.getInput9On.bind(this));
    }

    this.client.subscribe((event) => {
      this.platform.log.debug('Received event:', event);
    });

    this.client.data.subscribe((data) => {
      this.platform.log.debug('Received data:', data);
    });

    this.client.subscribe(
      (event) => {
        this.platform.log.debug('Received event:', event);
      },
      (error) => {
        this.platform.log.error('An error occurred:', error);
      },
    );
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  async setOn(value: CharacteristicValue) {
    // implement your own code to turn your device on/off
    this.NADStates.On = value as boolean;
    this.platform.log.debug('Set Characteristic On ->', value);
  }

  async getOn(): Promise<CharacteristicValue> {
    // implement your own code to check if the device is on

    this.client.filter((event) => event instanceof Telnet.Event.Connected)
      .subscribe((event) => {
        this.platform.log.debug('Event: ', event.timestamp);
        this.NADConnect.Connected = true;
        this.client.sendln('Main.Power=?');
      });

    this.client.data
      .subscribe((data) => {
        if (!this.NADConnect.Connected) {
          return;
        }
        this.platform.log.debug('Received GetOn data:', data);
      });

    this.client.connect();

    const isOn = this.NADStates.On;
    this.platform.log.debug('Get Characteristic On ->', isOn);

    // if you need to return an error to show the device as "Not Responding" in the Home app:
    // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);

    this.client.disconnect();

    return isOn;
  }

  async setInput1On(value: CharacteristicValue) {
    if (value as boolean) {
      this.NADStates.SelectedInput = 1;
    }
    this.platform.log.debug('Set Characteristic On input 1 ->', value);
  }

  async getInput1On(): Promise<CharacteristicValue> {
    const isOn = this.NADStates.SelectedInput === 1;
    this.platform.log.debug('Get Characteristic On input 1 ->', isOn);
    return isOn;
  }

  async setInput2On(value: CharacteristicValue) {
    if (value as boolean) {
      this.NADStates.SelectedInput = 2;
    }
    this.platform.log.debug('Set Characteristic On input 2 ->', value);
  }

  async getInput2On(): Promise<CharacteristicValue> {
    const isOn = this.NADStates.SelectedInput === 2;
    this.platform.log.debug('Get Characteristic On input 2 ->', isOn);
    return isOn;
  }

  async setInput3On(value: CharacteristicValue) {
    if (value as boolean) {
      this.NADStates.SelectedInput = 3;
    }
    this.platform.log.debug('Set Characteristic On input 3 ->', value);
  }

  async getInput3On(): Promise<CharacteristicValue> {
    const isOn = this.NADStates.SelectedInput === 3;
    this.platform.log.debug('Get Characteristic On input 3 ->', isOn);
    return isOn;
  }

  async setInput4On(value: CharacteristicValue) {
    if (value as boolean) {
      this.NADStates.SelectedInput = 4;
    }
    this.platform.log.debug('Set Characteristic On input 4 ->', value);
  }

  async getInput4On(): Promise<CharacteristicValue> {
    const isOn = this.NADStates.SelectedInput === 4;
    this.platform.log.debug('Get Characteristic On input 4 ->', isOn);
    return isOn;
  }

  async setInput5On(value: CharacteristicValue) {
    if (value as boolean) {
      this.NADStates.SelectedInput = 5;
    }
    this.platform.log.debug('Set Characteristic On input 5 ->', value);
  }

  async getInput5On(): Promise<CharacteristicValue> {
    const isOn = this.NADStates.SelectedInput === 5;
    this.platform.log.debug('Get Characteristic On input 5 ->', isOn);
    return isOn;
  }

  async setInput6On(value: CharacteristicValue) {
    if (value as boolean) {
      this.NADStates.SelectedInput = 6;
    }
    this.platform.log.debug('Set Characteristic On input 6 ->', value);
  }

  async getInput6On(): Promise<CharacteristicValue> {
    const isOn = this.NADStates.SelectedInput === 6;
    this.platform.log.debug('Get Characteristic On input 6 ->', isOn);
    return isOn;
  }

  async setInput7On(value: CharacteristicValue) {
    if (value as boolean) {
      this.NADStates.SelectedInput = 7;
    }
    this.platform.log.debug('Set Characteristic On input 7 ->', value);
  }

  async getInput7On(): Promise<CharacteristicValue> {
    const isOn = this.NADStates.SelectedInput === 7;
    this.platform.log.debug('Get Characteristic On input 7 ->', isOn);
    return isOn;
  }

  async setInput8On(value: CharacteristicValue) {
    if (value as boolean) {
      this.NADStates.SelectedInput = 8;
    }
    this.platform.log.debug('Set Characteristic On input 8 ->', value);
  }

  async getInput8On(): Promise<CharacteristicValue> {
    const isOn = this.NADStates.SelectedInput === 8;
    this.platform.log.debug('Get Characteristic On input 8 ->', isOn);
    return isOn;
  }

  async setInput9On(value: CharacteristicValue) {
    if (value as boolean) {
      this.NADStates.SelectedInput = 9;
    }
    this.platform.log.debug('Set Characteristic On input 9 ->', value);
  }

  async getInput9On(): Promise<CharacteristicValue> {
    const isOn = this.NADStates.SelectedInput === 9;
    this.platform.log.debug('Get Characteristic On input 9 ->', isOn);
    return isOn;
  }

  async handleMuteGet() {
    const currentValue = this.NADStates.Mute;
    this.platform.log.debug('Triggered GET Mute', currentValue);
    return currentValue;
  }

  async handleMuteSet(value) {
    this.NADStates.Mute = value as boolean;
    this.platform.log.debug('Triggered SET Mute:', value);
  }

  async getVolume(): Promise<CharacteristicValue> {
    const volume = this.NADStates.Volume;
    this.platform.log.debug('Get Characteristic Volume -> ', volume);
    return volume;
  }

  async setVolume(value: CharacteristicValue) {
    this.NADStates.Volume = value as number;
    this.platform.log.debug('Set Characteristic Volume -> ', value);
  }
}
