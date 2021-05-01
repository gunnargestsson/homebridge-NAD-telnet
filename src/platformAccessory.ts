/* eslint-disable max-len */
import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { NADHomebridgePlatform } from './platform';
import Telnet from 'telnet-client';


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

    this.platform.log.debug('Adding power switch service');
    // get the Switch service if it exists, otherwise create a new Switch service
    // you can create multiple services for each accessory
    this.power = this.accessory.getService('Power') || this.accessory.addService(this.platform.Service.Switch, 'Power');

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.power.setCharacteristic(this.platform.Characteristic.Name, (this.platform.config.name || 'NAD') + ' Power');

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Switch

    // register handlers for the On/Off Characteristic
    this.power.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this))
      .onGet(this.getOn.bind(this));

    this.platform.log.debug('Adding speaker service');
    this.speaker = this.accessory.getService('Speakers') || this.accessory.addService(this.platform.Service.Speaker, 'Speakers');
    this.speaker.setCharacteristic(this.platform.Characteristic.Name, (this.platform.config.name || 'NAD') + ' Speakers');
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
      this.platform.log.debug('Adding input switch service:', inputName);
      this.input1 = this.accessory.addService(this.platform.Service.Switch, (this.platform.config.name || 'NAD') + ' ' + inputName, 'NADinput1');
      this.input1.setCharacteristic(this.platform.Characteristic.Name, (this.platform.config.name || 'NAD') + ' ' + inputName);
      this.input1.getCharacteristic(this.platform.Characteristic.On)
        .onSet(this.setInput1On.bind(this))
        .onGet(this.getInput1On.bind(this));
    }

    if (this.inputs.find(i => i.number === 2)) {
      inputName = this.inputs.find(i => i.number === 2).name;
      this.platform.log.debug('Adding input switch service:', inputName);
      this.input2 = this.accessory.addService(this.platform.Service.Switch, (this.platform.config.name || 'NAD') + ' ' + inputName, 'NADinput2');
      this.input2.setCharacteristic(this.platform.Characteristic.Name, (this.platform.config.name || 'NAD') + ' ' + inputName);
      this.input2.getCharacteristic(this.platform.Characteristic.On)
        .onSet(this.setInput2On.bind(this))
        .onGet(this.getInput2On.bind(this));
    }

    if (this.inputs.find(i => i.number === 3)) {
      inputName = this.inputs.find(i => i.number === 3).name;
      this.platform.log.debug('Adding input switch service:', inputName);
      this.input3 = this.accessory.addService(this.platform.Service.Switch, (this.platform.config.name || 'NAD') + ' ' + inputName, 'NADinput3');
      this.input3.setCharacteristic(this.platform.Characteristic.Name, (this.platform.config.name || 'NAD') + ' ' + inputName);
      this.input3.getCharacteristic(this.platform.Characteristic.On)
        .onSet(this.setInput3On.bind(this))
        .onGet(this.getInput3On.bind(this));
    }

    if (this.inputs.find(i => i.number === 4)) {
      inputName = this.inputs.find(i => i.number === 4).name;
      this.platform.log.debug('Adding input switch service:', inputName);
      this.input4 = this.accessory.addService(this.platform.Service.Switch, (this.platform.config.name || 'NAD') + ' ' + inputName, 'NADinput4');
      this.input4.setCharacteristic(this.platform.Characteristic.Name, (this.platform.config.name || 'NAD') + ' ' + inputName);
      this.input4.getCharacteristic(this.platform.Characteristic.On)
        .onSet(this.setInput4On.bind(this))
        .onGet(this.getInput4On.bind(this));
    }

    if (this.inputs.find(i => i.number === 5)) {
      inputName = this.inputs.find(i => i.number === 5).name;
      this.platform.log.debug('Adding input switch service:', inputName);
      this.input5 = this.accessory.addService(this.platform.Service.Switch, (this.platform.config.name || 'NAD') + ' ' + inputName, 'NADinput5');
      this.input5.setCharacteristic(this.platform.Characteristic.Name, (this.platform.config.name || 'NAD') + ' ' + inputName);
      this.input5.getCharacteristic(this.platform.Characteristic.On)
        .onSet(this.setInput5On.bind(this))
        .onGet(this.getInput5On.bind(this));
    }

    if (this.inputs.find(i => i.number === 6)) {
      inputName = this.inputs.find(i => i.number === 6).name;
      this.platform.log.debug('Adding input switch service:', inputName);
      this.input6 = this.accessory.addService(this.platform.Service.Switch, (this.platform.config.name || 'NAD') + ' ' + inputName, 'NADinput6');
      this.input6.setCharacteristic(this.platform.Characteristic.Name, (this.platform.config.name || 'NAD') + ' ' + inputName);
      this.input6.getCharacteristic(this.platform.Characteristic.On)
        .onSet(this.setInput6On.bind(this))
        .onGet(this.getInput6On.bind(this));
    }

    if (this.inputs.find(i => i.number === 7)) {
      inputName = this.inputs.find(i => i.number === 7).name;
      this.platform.log.debug('Adding input switch service:', inputName);
      this.input7 = this.accessory.addService(this.platform.Service.Switch, (this.platform.config.name || 'NAD') + ' ' + inputName, 'NADinput7');
      this.input7.setCharacteristic(this.platform.Characteristic.Name, (this.platform.config.name || 'NAD') + ' ' + inputName);
      this.input7.getCharacteristic(this.platform.Characteristic.On)
        .onSet(this.setInput7On.bind(this))
        .onGet(this.getInput7On.bind(this));
    }

    if (this.inputs.find(i => i.number === 8)) {
      inputName = this.inputs.find(i => i.number === 8).name;
      this.platform.log.debug('Adding input switch service:', inputName);
      this.input8 = this.accessory.addService(this.platform.Service.Switch, (this.platform.config.name || 'NAD') + ' ' + inputName, 'NADinput8');
      this.input8.setCharacteristic(this.platform.Characteristic.Name, (this.platform.config.name || 'NAD') + ' ' + inputName);
      this.input8.getCharacteristic(this.platform.Characteristic.On)
        .onSet(this.setInput8On.bind(this))
        .onGet(this.getInput8On.bind(this));
    }

    if (this.inputs.find(i => i.number === 9)) {
      inputName = this.inputs.find(i => i.number === 9).name;
      this.platform.log.debug('Adding input switch service:', inputName);
      this.input9 = this.accessory.addService(this.platform.Service.Switch, (this.platform.config.name || 'NAD') + ' ' + inputName, 'NADinput9');
      this.input9.setCharacteristic(this.platform.Characteristic.Name, (this.platform.config.name || 'NAD') + ' ' + inputName);
      this.input9.getCharacteristic(this.platform.Characteristic.On)
        .onSet(this.setInput9On.bind(this))
        .onGet(this.getInput9On.bind(this));
    }

  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */

  async setOn(value: CharacteristicValue) {
    this.platform.log.debug('Set Power On ->', value);
    if (value as boolean) {
      await this.sendToNAD('Main.Power=On');
    } else {
      await this.sendToNAD('Main.Power=Off');
    }
  }

  async getOn(): Promise<CharacteristicValue> {
    const isOn = this.NADStates.On;
    this.platform.log.debug('Get Power On ->', isOn);
    await this.sendToNAD('Main.Power=?');
    return isOn;
  }

  async setInput1On(value: CharacteristicValue) {
    if (value as boolean) {
      this.NADStates.SelectedInput = 1;
    }
    await this.sendToNAD('Main.Source=' + this.NADStates.SelectedInput);
    this.platform.log.debug('Set input 1 ->', value);
  }

  async getInput1On(): Promise<CharacteristicValue> {
    await this.sendToNAD('Main.Source=?');
    const isOn = this.NADStates.SelectedInput === 1;
    this.platform.log.debug('Get input 1 ->', isOn);
    return isOn;
  }

  async setInput2On(value: CharacteristicValue) {
    if (value as boolean) {
      this.NADStates.SelectedInput = 2;
    }
    await this.sendToNAD('Main.Source=' + this.NADStates.SelectedInput);
    this.platform.log.debug('Set input 2 ->', value);
  }

  async getInput2On(): Promise<CharacteristicValue> {
    await this.sendToNAD('Main.Source=?');
    const isOn = this.NADStates.SelectedInput === 2;
    this.platform.log.debug('Get input 2 ->', isOn);
    return isOn;
  }

  async setInput3On(value: CharacteristicValue) {
    if (value as boolean) {
      this.NADStates.SelectedInput = 3;
    }
    await this.sendToNAD('Main.Source=' + this.NADStates.SelectedInput);
    this.platform.log.debug('Set input 3 ->', value);
  }

  async getInput3On(): Promise<CharacteristicValue> {
    await this.sendToNAD('Main.Source=?');
    const isOn = this.NADStates.SelectedInput === 3;
    this.platform.log.debug('Get input 3 ->', isOn);
    return isOn;
  }

  async setInput4On(value: CharacteristicValue) {
    if (value as boolean) {
      this.NADStates.SelectedInput = 4;
    }
    await this.sendToNAD('Main.Source=' + this.NADStates.SelectedInput);
    this.platform.log.debug('Set input 4 ->', value);
  }

  async getInput4On(): Promise<CharacteristicValue> {
    await this.sendToNAD('Main.Source=?');
    const isOn = this.NADStates.SelectedInput === 4;
    this.platform.log.debug('Get input 4 ->', isOn);
    return isOn;
  }

  async setInput5On(value: CharacteristicValue) {
    if (value as boolean) {
      this.NADStates.SelectedInput = 5;
    }
    await this.sendToNAD('Main.Source=' + this.NADStates.SelectedInput);
    this.platform.log.debug('Set input 5 ->', value);
  }

  async getInput5On(): Promise<CharacteristicValue> {
    await this.sendToNAD('Main.Source=?');
    const isOn = this.NADStates.SelectedInput === 5;
    this.platform.log.debug('Get input 5 ->', isOn);
    return isOn;
  }

  async setInput6On(value: CharacteristicValue) {
    if (value as boolean) {
      this.NADStates.SelectedInput = 6;
    }
    await this.sendToNAD('Main.Source=' + this.NADStates.SelectedInput);
    this.platform.log.debug('Set input 6 ->', value);
  }

  async getInput6On(): Promise<CharacteristicValue> {
    await this.sendToNAD('Main.Source=?');
    const isOn = this.NADStates.SelectedInput === 6;
    this.platform.log.debug('Get input 6 ->', isOn);
    return isOn;
  }

  async setInput7On(value: CharacteristicValue) {
    if (value as boolean) {
      this.NADStates.SelectedInput = 7;
    }
    await this.sendToNAD('Main.Source=' + this.NADStates.SelectedInput);
    this.platform.log.debug('Set input 7 ->', value);
  }

  async getInput7On(): Promise<CharacteristicValue> {
    await this.sendToNAD('Main.Source=?');
    const isOn = this.NADStates.SelectedInput === 7;
    this.platform.log.debug('Get input 7 ->', isOn);
    return isOn;
  }

  async setInput8On(value: CharacteristicValue) {
    if (value as boolean) {
      this.NADStates.SelectedInput = 8;
    }
    await this.sendToNAD('Main.Source=' + this.NADStates.SelectedInput);
    this.platform.log.debug('Set input 8 ->', value);
  }

  async getInput8On(): Promise<CharacteristicValue> {
    await this.sendToNAD('Main.Source=?');
    const isOn = this.NADStates.SelectedInput === 8;
    this.platform.log.debug('Get input 8 ->', isOn);
    return isOn;
  }

  async setInput9On(value: CharacteristicValue) {
    if (value as boolean) {
      this.NADStates.SelectedInput = 9;
    }
    await this.sendToNAD('Main.Source=' + this.NADStates.SelectedInput);
    this.platform.log.debug('Set input 9 ->', value);
  }

  async getInput9On(): Promise<CharacteristicValue> {
    await this.sendToNAD('Main.Source=?');
    const isOn = this.NADStates.SelectedInput === 9;
    this.platform.log.debug('Get input 9 ->', isOn);
    return isOn;
  }

  async handleMuteGet() {
    await this.sendToNAD('Main.Mute=?');
    const currentValue = this.NADStates.Mute;
    this.platform.log.debug('Triggered GET Mute', currentValue);
    return currentValue;
  }

  async handleMuteSet(value) {
    this.NADStates.Mute = value as boolean;
    if (value as boolean) {
      await this.sendToNAD('Main.Mute=On');
    } else {
      await this.sendToNAD('Main.Mute=Off');
    }
    this.platform.log.debug('Triggered SET Mute:', value);
  }

  async getVolume(): Promise<CharacteristicValue> {
    await this.sendToNAD('Main.Volume=?');
    const volume = this.NADStates.Volume + 100;
    this.platform.log.debug('Get Volume ->', volume);
    return volume;
  }

  async setVolume(value: CharacteristicValue) {
    const volume = value as number - 100;
    await this.sendToNAD('Main.Volume=' + volume);
    this.platform.log.debug('Set Volume ->', volume);
  }

  async sendToNAD(commandToSend: string) {
    const connection = new Telnet();
    const params = {
      host: this.platform.config.ip,
      port: this.platform.config.port || 23,
      shellPrompt: 'Main.Model=' + this.platform.config.model,
      timeout: 3000,
    };

    this.platform.log.debug('connection to ', params.host);
    this.platform.log.debug('waiting for', params.shellPrompt);
    try {
      await connection.connect(params);
    } catch(error) {
      this.platform.log.error('connection error', error);
      return;
    }

    this.platform.log.debug('Sending: ', commandToSend);
    const res = await connection.send(commandToSend);
    this.platform.log.debug('async result:', res);
    connection.destroy();
    await this.HandleNADResponse(res);
  }

  async HandleNADResponse(NADData: string) {
    this.platform.log.debug('Evaluating response', NADData);
    if (NADData.indexOf('Main.Power=On') === 0) {
      this.NADStates.On = true;
      this.power.updateCharacteristic(this.platform.Characteristic.On, true);
    }
    if (NADData.indexOf('Main.Power=Off') === 0) {
      this.NADStates.On = false;
      this.power.updateCharacteristic(this.platform.Characteristic.On, false);
    }
    if (NADData.indexOf('Main.Mute=On') === 0) {
      this.NADStates.On = true;
      this.speaker.updateCharacteristic(this.platform.Characteristic.Mute, true);
    }
    if (NADData.indexOf('Main.Mute=Off') === 0) {
      this.NADStates.On = false;
      this.speaker.updateCharacteristic(this.platform.Characteristic.Mute, false);
    }
    if (NADData.indexOf('Main.Volume=') === 0) {
      const volume = NADData.substr(12);
      this.platform.log.debug('NAD Volume is:', volume);
      this.NADStates.Volume = volume as unknown as number;
      this.speaker.updateCharacteristic(this.platform.Characteristic.Volume, 100 + this.NADStates.Volume);
    }
    if (NADData.indexOf('Main.Source=') === 0) {
      const source = NADData.substr(12);
      this.platform.log.debug('NAD Source is:', source);
      this.NADStates.SelectedInput = source as unknown as number;
      if (typeof this.input1 !== 'undefined') {
        this.input1.updateCharacteristic(this.platform.Characteristic.On, (this.NADStates.SelectedInput === 1));
      }
      if (typeof this.input2 !== 'undefined') {
        this.input2.updateCharacteristic(this.platform.Characteristic.On, (this.NADStates.SelectedInput === 2));
      }
      if (typeof this.input3 !== 'undefined') {
        this.input3.updateCharacteristic(this.platform.Characteristic.On, (this.NADStates.SelectedInput === 3));
      }
      if (typeof this.input4 !== 'undefined') {
        this.input4.updateCharacteristic(this.platform.Characteristic.On, (this.NADStates.SelectedInput === 4));
      }
      if (typeof this.input5 !== 'undefined') {
        this.input5.updateCharacteristic(this.platform.Characteristic.On, (this.NADStates.SelectedInput === 5));
      }
      if (typeof this.input6 !== 'undefined') {
        this.input6.updateCharacteristic(this.platform.Characteristic.On, (this.NADStates.SelectedInput === 6));
      }
      if (typeof this.input7 !== 'undefined') {
        this.input7.updateCharacteristic(this.platform.Characteristic.On, (this.NADStates.SelectedInput === 7));
      }
      if (typeof this.input8 !== 'undefined') {
        this.input8.updateCharacteristic(this.platform.Characteristic.On, (this.NADStates.SelectedInput === 8));
      }
      if (typeof this.input9 !== 'undefined') {
        this.input9.updateCharacteristic(this.platform.Characteristic.On, (this.NADStates.SelectedInput === 9));
      }
    }
  }
}
