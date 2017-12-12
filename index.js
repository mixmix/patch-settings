const nest = require('depnest')
const { Value, computed } = require('mutant')
const get = require('lodash.get')
const set = require('lodash.set')
const merge = require('lodash.merge')
const deepEqual = require('deep-equal')

const STORAGE_KEY = 'patchSettings'

const gives = nest({
  'settings.sync.get': true,
  'settings.sync.set': true,
  'settings.obs.get': true,
})

const create = (api) => {
  var _settings

  return nest({
    'settings.sync.get': getSync,
    'settings.sync.set': setSync,
    'settings.obs.get': getObs,
  })

  function getSync (path, fallback) {
    _initialise()
    if (!path) return _settings()

    return get(_settings(), path, fallback)
  }

  function setSync (newSettings) {
    _initialise()

    const updatedSettings = merge({}, _settings(), newSettings)
    _settings.set(updatedSettings)
  }

  function getObs (path, fallback) {
    _initialise()
    if (!path) return _settings

    var obs = computed(_settings, s => get(s, path, fallback), {comparer: deepEqual})
    obs.set = function (value) {
      if (value !== obs()) {
        var updatedSettings = merge({}, _settings())
        set(updatedSettings, path, value)
        _settings.set(updatedSettings)
      }
    }

    return obs
  }

  function _initialise () {
    if (_settings) return

    const settings = localStorage[STORAGE_KEY]
      ? JSON.parse(localStorage[STORAGE_KEY])
      : {}
    _settings = Value(settings)

    // initialise a listener to persist on changes
    _settings(_save)
  }

  function _save (newSettings) {
    localStorage[STORAGE_KEY]= JSON.stringify(newSettings)
  }
}

module.exports = {
  patchSettings: {
    gives,
    create
  }
}
