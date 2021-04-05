/* eslint-disable max-len */
import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { NADHomebridgePlatform } from './platform';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different power types.
 */
export class NADPlatformAccessory {
  private power: Service;
  private speaker: Service;
  private input1: Service;
  private input2: Service;
  private input3: Service;
  private input4: Service;
  private input5: Service;
  private input6: Service;
  private input7: Service;
  private input8: Service;
  private input9: Service;
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

  constructor(
    private readonly platform: NADHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'NAD Electronics')
      .setCharacteristic(this.platform.Characteristic.Model, this.platform.config.model || 'unknown')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.platform.config.serialNumber || 'unknown');

    // get the Switch service if it exists, otherwise create a new Switch service
    // you can create multiple services for each accessory
    this.power = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.power.setCharacteristic(this.platform.Characteristic.Name, (this.platform.config.model || 'NAD') + ' Power');

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Switch

    // register handlers for the On/Off Characteristic
    this.power.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this))
      .onGet(this.getOn.bind(this));

    this.speaker = this.accessory.getService(this.platform.Service.Speaker) || this.accessory.addService(this.platform.Service.Speaker);
    this.speaker.setCharacteristic(this.platform.Characteristic.Name, (this.platform.config.model || 'NAD') + ' Speaker');
    this.speaker.getCharacteristic(this.platform.Characteristic.Mute)
      .onGet(this.handleMuteGet.bind(this))
      .onSet(this.handleMuteSet.bind(this));

    this.speaker.getCharacteristic(this.platform.Characteristic.Volume)
      .onSet(this.setVolume.bind(this))
      .onGet(this.getVolume.bind(this));

    this.power = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);

    let inputName = 'Input 1';
    this.input1 = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);
    this.input1.setCharacteristic(this.platform.Characteristic.Name, (this.platform.config.model || 'NAD') + ' ' + inputName);
    this.input1.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setInput1On.bind(this))
      .onGet(this.getInput1On.bind(this));

    inputName = 'Input 2';
    this.input2 = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);
    this.input2.setCharacteristic(this.platform.Characteristic.Name, (this.platform.config.model || 'NAD') + ' ' + inputName);
    this.input2.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setInput2On.bind(this))
      .onGet(this.getInput2On.bind(this));

    inputName = 'Input 3';
    this.input3 = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);
    this.input3.setCharacteristic(this.platform.Characteristic.Name, (this.platform.config.model || 'NAD') + ' ' + inputName);
    this.input3.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setInput3On.bind(this))
      .onGet(this.getInput3On.bind(this));

    inputName = 'Input 4';
    this.input4 = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);
    this.input4.setCharacteristic(this.platform.Characteristic.Name, (this.platform.config.model || 'NAD') + ' ' + inputName);
    this.input4.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setInput4On.bind(this))
      .onGet(this.getInput4On.bind(this));

    inputName = 'Input 5';
    this.input5 = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);
    this.input5.setCharacteristic(this.platform.Characteristic.Name, (this.platform.config.model || 'NAD') + ' ' + inputName);
    this.input5.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setInput5On.bind(this))
      .onGet(this.getInput5On.bind(this));

    inputName = 'Input 6';
    this.input6 = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);
    this.input6.setCharacteristic(this.platform.Characteristic.Name, (this.platform.config.model || 'NAD') + ' ' + inputName);
    this.input6.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setInput6On.bind(this))
      .onGet(this.getInput6On.bind(this));

    inputName = 'Input 7';
    this.input7 = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);
    this.input7.setCharacteristic(this.platform.Characteristic.Name, (this.platform.config.model || 'NAD') + ' ' + inputName);
    this.input7.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setInput7On.bind(this))
      .onGet(this.getInput7On.bind(this));

    inputName = 'Input 8';
    this.input8 = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);
    this.input8.setCharacteristic(this.platform.Characteristic.Name, (this.platform.config.model || 'NAD') + ' ' + inputName);
    this.input8.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setInput8On.bind(this))
      .onGet(this.getInput8On.bind(this));

    inputName = 'Input 9';
    this.input9 = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);
    this.input9.setCharacteristic(this.platform.Characteristic.Name, (this.platform.config.model || 'NAD') + ' ' + inputName);
    this.input9.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setInput9On.bind(this))
      .onGet(this.getInput9On.bind(this));
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
    const isOn = this.NADStates.On;
    this.platform.log.debug('Get Characteristic On ->', isOn);

    // if you need to return an error to show the device as "Not Responding" in the Home app:
    // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);

    return isOn;
  }

  async setInput1On(value: CharacteristicValue) {
    if (value as boolean) {
      this.NADStates.SelectedInput = 1;
    }
    this.platform.log.debug('Set Characteristic On input ->', 1, value);
  }

  async getInput1On(): Promise<CharacteristicValue> {
    const isOn = this.NADStates.SelectedInput === 1;
    this.platform.log.debug('Get Characteristic On input ->', 1, isOn);
    return isOn;
  }

  async setInput2On(value: CharacteristicValue) {
    if (value as boolean) {
      this.NADStates.SelectedInput = 2;
    }
    this.platform.log.debug('Set Characteristic On input ->', 2, value);
  }

  async getInput2On(): Promise<CharacteristicValue> {
    const isOn = this.NADStates.SelectedInput === 2;
    this.platform.log.debug('Get Characteristic On input ->', 2, isOn);
    return isOn;
  }

  async setInput3On(value: CharacteristicValue) {
    if (value as boolean) {
      this.NADStates.SelectedInput = 3;
    }
    this.platform.log.debug('Set Characteristic On input ->', 3, value);
  }

  async getInput3On(): Promise<CharacteristicValue> {
    const isOn = this.NADStates.SelectedInput === 3;
    this.platform.log.debug('Get Characteristic On input ->', 3, isOn);
    return isOn;
  }

  async setInput4On(value: CharacteristicValue) {
    if (value as boolean) {
      this.NADStates.SelectedInput = 4;
    }
    this.platform.log.debug('Set Characteristic On input ->', 4, value);
  }

  async getInput4On(): Promise<CharacteristicValue> {
    const isOn = this.NADStates.SelectedInput === 4;
    this.platform.log.debug('Get Characteristic On input ->', 4, isOn);
    return isOn;
  }

  async setInput5On(value: CharacteristicValue) {
    if (value as boolean) {
      this.NADStates.SelectedInput = 5;
    }
    this.platform.log.debug('Set Characteristic On input ->', 5, value);
  }

  async getInput5On(): Promise<CharacteristicValue> {
    const isOn = this.NADStates.SelectedInput === 5;
    this.platform.log.debug('Get Characteristic On input ->', 5, isOn);
    return isOn;
  }

  async setInput6On(value: CharacteristicValue) {
    if (value as boolean) {
      this.NADStates.SelectedInput = 6;
    }
    this.platform.log.debug('Set Characteristic On input ->', 6, value);
  }

  async getInput6On(): Promise<CharacteristicValue> {
    const isOn = this.NADStates.SelectedInput === 6;
    this.platform.log.debug('Get Characteristic On input ->', 6, isOn);
    return isOn;
  }

  async setInput7On(value: CharacteristicValue) {
    if (value as boolean) {
      this.NADStates.SelectedInput = 7;
    }
    this.platform.log.debug('Set Characteristic On input ->', 7, value);
  }

  async getInput7On(): Promise<CharacteristicValue> {
    const isOn = this.NADStates.SelectedInput === 7;
    this.platform.log.debug('Get Characteristic On input ->', 7, isOn);
    return isOn;
  }

  async setInput8On(value: CharacteristicValue) {
    if (value as boolean) {
      this.NADStates.SelectedInput = 8;
    }
    this.platform.log.debug('Set Characteristic On input ->', 8, value);
  }

  async getInput8On(): Promise<CharacteristicValue> {
    const isOn = this.NADStates.SelectedInput === 8;
    this.platform.log.debug('Get Characteristic On input ->', 8, isOn);
    return isOn;
  }

  async setInput9On(value: CharacteristicValue) {
    if (value as boolean) {
      this.NADStates.SelectedInput = 9;
    }
    this.platform.log.debug('Set Characteristic On input ->', 9, value);
  }

  async getInput9On(): Promise<CharacteristicValue> {
    const isOn = this.NADStates.SelectedInput === 9;
    this.platform.log.debug('Get Characteristic On input ->', 9, isOn);
    return isOn;
  }

  /**
   * Handle requests to get the current value of the "Mute" characteristic
   */
  async handleMuteGet() {
    this.platform.log.debug('Triggered GET Mute');

    // set this to a valid value for Mute
    const currentValue = 1;

    return currentValue;
  }

  /**
   * Handle requests to set the "Mute" characteristic
   */
  async handleMuteSet(value) {
    this.platform.log.debug('Triggered SET Mute:', value);
  }

  async getVolume(): Promise<CharacteristicValue> {
    // implement your own code to set the volume
    const volume = this.NADStates.Volume;

    this.platform.log.debug('Get Characteristic Volume -> ', volume);

    return volume;
  }

  async setVolume(value: CharacteristicValue) {
    // implement your own code to set the volume
    this.NADStates.Volume = value as number;

    this.platform.log.debug('Set Characteristic Volume -> ', value);
  }
}
