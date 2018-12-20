// Basic Opennode API
//
// 1. Add your API key
// 2. npm install node-fetch
// 3. A URL will be printed in console
// 4. Pay it, "Invoice paid!" will appear

const fetch = require('node-fetch');

// Warning: setting this to false means people can lose real money from bugs
const TESTNET = true;

// Mid level API key (read-only), get your own testnet key at dev.opennode.co
const API_KEY = TESTNET ? "[INSERT TESTNET KEY HERE]" : "[MAINNET KEY HERE]";

const OPENNODE_API = "https://" + (TESTNET ? "dev-" : "") + "api.opennode.co/v1";
const ID_SITE = "https://" + (TESTNET ? "dev." : "") + "opennode.co/checkout/";

// General function that fetches data from the API
async function getData(url, body)
{
	var headers = {'Content-Type': 'application/json', 'Authorization': API_KEY};
	var method  = body === undefined ? 'GET' : 'POST';
	var request = { method: method, body: JSON.stringify(body), headers: headers };
	
	var result = await fetch(OPENNODE_API + url, request);
		result = await result.json();
	
	return result.data;
}

// Creates invoices of a certain amount (USD by default), and a Lightning address
async function createInvoice(amount, currency = "USD")
{
	var invoice = { "amount": amount, "currency": currency };
	var result  = await getData('/charges', invoice);

	invoice.id = result.id;
	invoice.address = result.lightning_invoice.payreq;

	console.log("Invoice:\n" + ID_SITE + invoice.id);
	console.log("Payment address:\n" + invoice.address);
	
	return invoice;
}

// Checks whether a specific invoice has been paid
async function checkStatus(invoice)
{
	invoice = await invoice;

	var result = await getData('/charge/' + invoice.id);

	invoice.status = result.status;
	
	return invoice;
}

// Resolves when payment has been received
async function awaitPayment(invoice, delay = 3000)
{
	invoice = await invoice;
	
	if (invoice.status === "paid") { return console.log("Invoice paid!"); }

	await new Promise(resolve => setTimeout(resolve, delay));
	return awaitPayment(checkStatus(invoice), delay);
}

// Create invoice for 0.01 USD in bitcoin and wait for payment
awaitPayment(createInvoice(0.01));