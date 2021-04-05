/* eslint-disable max-len */
import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { NADHomebridgePlatform } from './platform';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class NADPlatformAccessory {
  private service: Service;

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private NADStates = {
    On: false,
    Volume : 0,
    Input: 1,
  };

  constructor(
    private readonly platform: NADHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'NAD Electronics')
      .setCharacteristic(this.platform.Characteristic.Model, this.platform.config.name || 'unknown')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.platform.config.serialNumber || 'unknown');

    // get the SmartSpeaker service if it exists, otherwise create a new SmartSpeaker service
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(this.platform.Service.SmartSpeaker) || this.accessory.addService(this.platform.Service.SmartSpeaker);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.NADDisplayName);

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/SmartSpeaker

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this))                // SET - bind to the `setOn` method below
      .onGet(this.getOn.bind(this));               // GET - bind to the `getOn` method below

    // register handlers for the Volume Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.Volume)
      .onSet(this.setVolume.bind(this))        // SET - bind to the 'setVolume` method below
      .onGet(this.getVolume.bind(this));       // SET - bind to the 'setVolume` method below

    // register handlers for the InputSourceType Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.InputSourceType)
      .onSet(this.setInputSourceType.bind(this))        // SET - bind to the 'setInputSourceType` method below
      .onGet(this.getInputSourceType.bind(this));       // SET - bind to the 'setInputSourceType` method below

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

  async getInputSourceType(): Promise<CharacteristicValue> {
    // implement your own code to set the volume
    const input = this.NADStates.Input;

    this.platform.log.debug('Get Characteristic Input Source Type -> ', input);

    return input;
  }

  async setInputSourceType(value: CharacteristicValue) {
    // implement your own code to set the volume
    this.NADStates.Input = value as number;

    this.platform.log.debug('Set Characteristic Input Source Type -> ', value);
  }
}
