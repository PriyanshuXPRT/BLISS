/**
 * Ghost Sub Background Script
 * Handles communication between content script, popup, and BLISS backend.
 */

const API_BASE = "https://bliss.xyz"

let detectedSubscription = null

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "subscriptionDetected") {
    detectedSubscription = request.data
    // Show badge on extension icon
    chrome.action.setBadgeText({ text: "!" })
    chrome.action.setBadgeBackgroundColor({ color: "#1a1a1a" })
    sendResponse({ status: "ok" })
  }

  if (request.action === "getDetected") {
    sendResponse({ data: detectedSubscription })
  }

  if (request.action === "clearDetected") {
    detectedSubscription = null
    chrome.action.setBadgeText({ text: "" })
    sendResponse({ status: "ok" })
  }

  if (request.action === "trackSubscription") {
    trackSubscription(request.data)
      .then(result => sendResponse({ status: "success", result }))
      .catch(err => sendResponse({ status: "error", error: err.message }))
    return true // async response
  }

  if (request.action === "getToken") {
    chrome.storage.local.get(["bliss_token"], (result) => {
      sendResponse({ token: result.bliss_token || null })
    })
    return true
  }

  if (request.action === "setToken") {
    chrome.storage.local.set({ bliss_token: request.token }, () => {
      sendResponse({ status: "ok" })
    })
    return true
  }
})

async function trackSubscription(data) {
  const { bliss_token } = await chrome.storage.local.get(["bliss_token"])
  if (!bliss_token) throw new Error("Not logged in. Open the extension and paste your token.")

  // Call the BLISS API to create a subscription
  const res = await fetch(`${API_BASE}/api/ghost-sub`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${bliss_token}`,
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${res.status}`)
  }

  // Clear the detection after successful tracking
  detectedSubscription = null
  chrome.action.setBadgeText({ text: "" })

  return await res.json()
}
