# Patch-settings

A module for managing settings in patch-* family apps. Settings are persisted to localStorage, and a couple of little methods are provided for gettings, settings, and observing!

You'll need to understand [depject](https://github.com/depject/depject) (a module for a different way of managing dependency injection), and for hte example below, [depnest](https://github.com/depject/depnest) - a lazy way to write nested objects quickly.

## Example 

```js
const nest = require('depject')
const { h } = require('mutant')

exports.gives = nest('app.page.settings')

exports.needs = nest({
  'settings.sync.get': 'first',
  'settings.sync.set': 'first'
}

exports.gives = (api) => {
  return nest('app.page.settings', settingsPage)

  function settingsPage (opts) => {

    const languages = [ 'en', 'es', 'de', 'zh' ]
    
    return h('div.page', [
      'Current language:',
      h('pre', api.settings.sync.get('language')),

      'Set your language:',
      languages.map( lang => {
        const setLang = () => api.settings.sync.set({ language: lang })
        return h('button', {'ev-click': setLang}, lang)
      })

    ])

  }
}
```

## API

### `settings.sync.get`

Called with no arguments, returns the whole settings object.

`(path=string, fallback=anyValue)`

Uses [lodash/get](https://lodash.com/docs/4.17.4#get) pattern.

Example:
```js
// settings = {
//   language: 'de',
//   colors {
//     primary: 'cyan'
//   }
// }

api.settings.sync.get('colors.primary',)
// => 'cyan'

api.settings.sync.get('colors.secondary')
// => undefined

api.settings.sync.get('colors.secondary', 'white')
// => 'white'
```


### `settings.sync.set`

`(newSettings=object)`

Uses [lodash/merge](https://lodash.com/docs/4.17.4#get) to recurssively merge newSettings into settings.

Example:
```js
api.settings.sync.set({ 
  colors: {
    primary: 'pink',
    secondary: 'teal'
  }
})
// => undefined

api.settings.sync.get()
// settings = {
//   language: 'de',
//   colors {
//     primary: 'pink'
//     secondary: 'teal'
//   }
// }
```


### `settings.obs.get`

`(path=string, fallbacl=anyValue)`

Similar to `settings.sync.get`, but returns a [Mutant](https://github.com/mmckegg/mutant) observeable. This can be given listeners which fire when part / all the state changes, or can be used when building views with Mutant.

