/* eslint-disable max-len */
import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { NADHomebridgePlatform } from './platform';

import { Event, Telnet } from 'telnet-rxjs';

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

  private connectionparams = {
    host: this.platform.config.ip,
    port: parseInt(this.platform.config.port) || 23,
  };

  private connectedToNAD = false;
  private client = Telnet.client(this.connectionparams.host + ':' + this.connectionparams.port);

  private clientObserver = {
    next: (event: Event) => {
      if (event instanceof Telnet.Event.Connecting) {
        this.platform.log.debug('Connecting');
      }
      if (event instanceof Telnet.Event.Connected) {
        this.connectedToNAD = true;
        this.platform.log.debug('Connected');
      }
      if (event instanceof Telnet.Event.Disconnecting) {
        this.platform.log.debug('Disconnecting');
      }
      if (event instanceof Telnet.Event.Disconnected) {
        this.connectedToNAD = false;
        this.platform.log.debug('Disconnected');
      }
      if (event instanceof Telnet.Event.Data) {
        this.platform.log.debug('data', event.data);
        const NADData = event.data.trim();
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
          this.platform.log.debug('NAD Volume is: ', volume);
          this.speaker.updateCharacteristic(this.platform.Characteristic.Volume, volume);
          this.NADStates.Volume = volume as unknown as number;
        }
        if (NADData.indexOf('Main.Source=') === 0) {
          const source = NADData.substr(12);
          this.platform.log.debug('NAD Source is: ', source);
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
      if (event instanceof Telnet.Event.Command) {
        this.platform.log.debug('command', event.command);
      }
    },
    error: (err: string) => this.platform.log.error(err),
    complete: () => this.platform.log.debug('Subscription completed'),
  };

  constructor(
    private readonly platform: NADHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    this.client.subscribe(this.clientObserver);
    this.client.connect();

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
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  async setOn(value: CharacteristicValue) {
    // implement your own code to turn your device on/off
    this.platform.log.debug('Set Characteristic On ->', value);
    this.connectToNAD();
    if (value as boolean) {
      this.client.sendln('Main.Power=On');
    } else {
      this.client.sendln('Main.Power=Off');
    }
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
    this.connectToNAD();
    this.client.sendln('Main.Source=' + this.NADStates.SelectedInput);
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
    this.connectToNAD();
    this.client.sendln('Main.Source=' + this.NADStates.SelectedInput);
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
    this.connectToNAD();
    this.client.sendln('Main.Source=' + this.NADStates.SelectedInput);
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
    this.connectToNAD();
    this.client.sendln('Main.Source=' + this.NADStates.SelectedInput);
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
    this.connectToNAD();
    this.client.sendln('Main.Source=' + this.NADStates.SelectedInput);
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
    this.connectToNAD();
    this.client.sendln('Main.Source=' + this.NADStates.SelectedInput);
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
    this.connectToNAD();
    this.client.sendln('Main.Source=' + this.NADStates.SelectedInput);
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
    this.connectToNAD();
    this.client.sendln('Main.Source=' + this.NADStates.SelectedInput);
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
    this.connectToNAD();
    this.client.sendln('Main.Source=' + this.NADStates.SelectedInput);
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
    this.connectToNAD();
    if (value as boolean) {
      this.client.sendln('Main.Power=On');
    } else {
      this.client.sendln('Main.Power=Off');
    }
    this.platform.log.debug('Triggered SET Mute:', value);
  }

  async getVolume(): Promise<CharacteristicValue> {
    const volume = this.NADStates.Volume;
    this.platform.log.debug('Get Characteristic Volume -> ', 100 + volume);
    return volume;
  }

  async setVolume(value: CharacteristicValue) {
    const volume = value as number - 100;
    this.connectToNAD();
    this.client.sendln('Main.Volume=' + volume);
    this.platform.log.debug('Set Characteristic Volume -> ', volume);
  }

  async connectToNAD() {
    if (!this.connectedToNAD) {
      this.client.connect();
    }
  }
}
