const currencyOneEl = document.querySelector('[data-js="currency-one"]')
const currencyTwoEl = document.querySelector('[data-js="currency-two"]')
const currenciesEl = document.querySelector('[data-js="currencies-container"]')
const convertedValueEl = document.querySelector('[data-js="converted-value"]')
const valuePrecisionEl = document.querySelector('[data-js="conversion-precision"]')
const timesCurrencyOneEl = document.querySelector('[data-js="currency-one-times"]')

const showAlert = (err) => {
  const div = document.createElement('div')
  const button = document.createElement('button')

  div.textContent = err.message
  div.classList.add('alert','alert-warning','alert-dismissible','fade','show')
  div.setAttribute('role','alert')
  button.classList.add('btn-close')
  button.setAttribute('type','button')
  button.setAttribute('arial-label','Close')

  const removeAlert = () => div.remove()
  button.addEventListener('click', removeAlert)

  div.appendChild(button)
  currenciesEl.insertAdjacentElement('afterend', div)
}

const state = (() => {
  let exchangeRate = {}

  return {
    getExchangeRate: () => exchangeRate,
    setExchangeRate: newExchangeRate => {
      if(!newExchangeRate.conversion_rates){
        showAlert({message : 'O objeto precisa ter uma propriedade conversion_rates'})
        return
      }
      exchangeRate = newExchangeRate
      return exchangeRate
    }
  }
})()

const APIKey = 'e3816ff8068e09a9de169c73'
const getUrl = currency => `https://v6.exchangerate-api.com/v6/${APIKey}/latest/${currency}`

const getErrorMessage = errorType => ({
  'unsupported-code' : 'A moeda não existe em nosso banco de dados.',
  'malformed-request' : 'O endpoint do seu request precisa seguir a estrutura a seguir : https://v6.exchangerate-api.com/v6/YOUR-API-KEY/latest/USD',
  'invalid-key' : 'A chave da API não é válida.',
  'inactive-account' : 'Seu endereço de email não foi confirmado.',
  'quota-reached' : 'Sua conta alcançou o limite de request permitido em seu plano atual.'
})[errorType] || 'Não foi possível obter as informações'


const fetchExchangeRate = async url => {
  try {
    const response = await fetch(url)

    if (!response.ok) {
     // throw new Error('Sua conexão falhou. Não foi possível obter informações.')
    }
    
    const exchangeRateData = await response.json()

    if (exchangeRateData.result === 'error') {
      const errorMessage = getErrorMessage(exchangeRateData['error-type'])
      throw new Error(errorMessage)
    }

    return state.setExchangeRate(exchangeRateData)
  } catch (err) {
    showAlert(err)
  }
}

const getOptions = (selectedCurrency, conversion_rates) =>  {
  const setSelectedAttribute = currency => 
    currency === selectedCurrency ? 'selected' : ''
  const getOptionsAsArray = currency => 
    `<option ${setSelectedAttribute(currency)}>${currency}</option>`

  return Object.keys(conversion_rates)
  .map(getOptionsAsArray)
  .join('')
}

const getMultipliedExchangeRate = conversion_rates => {
  const currencyTwo = conversion_rates[currencyTwoEl.value]
  return (timesCurrencyOneEl.value * currencyTwo).toFixed(2)
}

const getNotRoundedExchangeRate = (conversion_rates) => {
  const currencyTwo = conversion_rates[currencyTwoEl.value]
  return `1 ${currencyOneEl.value} = ${1 * currencyTwo} ${currencyTwoEl.value}`
}

const showUpdatedRates = ({ conversion_rates }) => {
  convertedValueEl.textContent = getMultipliedExchangeRate(conversion_rates)
  valuePrecisionEl.textContent = getNotRoundedExchangeRate(conversion_rates)
}

const showInitialInfo = ({ conversion_rates }) => {

  currencyOneEl.innerHTML = getOptions('USD',conversion_rates)
  currencyTwoEl.innerHTML = getOptions('BRL',conversion_rates)

  showUpdatedRates({ conversion_rates })
}

const init = async () => {
  const url = getUrl('USD')
  const exchangeRate = await fetchExchangeRate(url)

  if(exchangeRate && exchangeRate.conversion_rates){
   showInitialInfo(exchangeRate)
  }
}

const handleTimesCurrencyOneElInput = () => {
  const { conversion_rates } = state.getExchangeRate()
  
  convertedValueEl.textContent = getMultipliedExchangeRate(conversion_rates)
}

const handleCurrencyTwoElInput = () => {
  const exchangeRate = state.getExchangeRate()
  showUpdatedRates(exchangeRate)
}

const handleCurrencyOneElInput = async event => {
  const url = getUrl(event.target.value)
  const exchangeRate = await fetchExchangeRate(url)

  showUpdatedRates(exchangeRate)
}

timesCurrencyOneEl.addEventListener('input', handleTimesCurrencyOneElInput)
currencyTwoEl.addEventListener('input', handleCurrencyTwoElInput)
currencyOneEl.addEventListener('input', handleCurrencyOneElInput)


//50:45 de video
init()