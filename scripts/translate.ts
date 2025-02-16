import fetch from 'node-fetch'

async function translateProducts() {
  try {
    const response = await fetch('http://localhost:3000/api/products/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    console.log('Translation result:', data)
  } catch (error) {
    console.error('Error running translation:', error)
  }
}

translateProducts() 