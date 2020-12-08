'use strict';

function assert(func, expected, card, testName) {
    if (func === expected) {
        createResult(card, true, `Test passed: ${testName}`);
        return;
    }

    createResult(card, false, `Test failed: ${testName}. Result is: ${func}`);
}

function assertRegex(func, expected, card, testName) {
    if ((func === null && expected === false)
        || (func && (func.length > 0) === expected)) {
        createResult(card, true, `Test passed: ${testName}`);
        return;
    }

    createResult(card, false, `Test failed: ${testName}. Result is: ${func}`);
}

async function assertInputFields(localFile, expectedFieldCount, actionElementId) {
    return new Promise((resolve) => {
        const iframe = document.getElementById('testFile');
        iframe.src = localFile;

        const iframeLoaded = function() {
            const frameContent = iframe.contentWindow.document.getElementsByTagName('body')[0];

            // Load prototypes to iframe. This doesn't work automatically from ui.js
            iframe.contentWindow.Element.prototype.getLowerCaseAttribute = function(attr) {
                return this.getAttribute(attr) ? this.getAttribute(attr).toLowerCase() : undefined;
            };

            // An user interaction is required before testing
            if (actionElementId) {
                const actionElement = frameContent.querySelector(actionElementId);
                if (actionElement) {
                    actionElement.click();
                }
            }

            const inputs = kpxcObserverHelper.getInputs(frameContent);
            assert(inputs.length, expectedFieldCount, Tests.KEEPASSXCBROWSER, `getInputs() for ${localFile} with ${expectedFieldCount} fields`);
            iframe.removeEventListener('load', iframeLoaded);
            resolve();
        };

        // Wait for iframe to load
        iframe.addEventListener('load', iframeLoaded);
    });
}

async function assertTOTPField(classStr, properties, testName, expectedResult) {
    const input = kpxcUI.createElement('input', classStr, properties);
    document.body.appendChild(input);

    const isAccepted = kpxcTOTPIcons.isAcceptedTOTPField(input);
    const isValid = kpxcTOTPIcons.isValid(input);

    document.body.removeChild(input);
    assert(isAccepted && isValid, expectedResult, Tests.TOTP, testName);
}

async function assertSearchField(classStr, properties, testName, expectedResult) {
    const input = kpxcUI.createElement('input', classStr, properties);
    document.body.appendChild(input);

    const isSearchfield = kpxcFields.isSearchField(input);

    document.body.removeChild(input);
    assert(isSearchfield, expectedResult, Tests.SEARCH, testName);
}

async function assertSearchForm(properties, testName, expectedResult) {
    const form = kpxcUI.createElement('form', '', { action: 'search' });
    const input = kpxcUI.createElement('input', '', properties);
    form.appendChild(input);
    document.body.appendChild(form);

    const isSearchfield = kpxcFields.isSearchField(input);

    document.body.removeChild(form);
    assert(isSearchfield, expectedResult, Tests.SEARCH, testName);
}
