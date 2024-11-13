console.log("Best Gift Rec");
const bestGiftSite = window.location.href.split("/")[3];
const BestGiftCompanyCode = window.sg.epp.common.companyCode;

// MX
// smartphone 01010000
// tablet 01020000
// watches 01030000
// audio 01040000
// accessories 01050000
const BGmxCategoryCode = ['01010000', '01020000', '01030000', '01040000', '01050000'];

// DA
// fridge 08030000
// washer 08010000
// oven 08080000
// dishwasher 08090000
// vaccum 08070000 --
// microwave 80110000 -- 
const BGdaCategoryCode = ['08030000', '08010000', '08080000', '08090000', '08110000'];
// VD
// TV 04010000
// lifeStyle TV 04020000
// TV accessories 04030000
// Soundbar 05010000
// Projector 04050000 
const BGvdCategoryCode = ['04010000', '04020000', '05010000', '04050000'];

const BestGiftProductApi = "global";
const priceMin = 399;
const priceMed = 699;
const priceMax = 1499;
const priceTabTextMin = "Gift under <br>$" + numberWithCommas(priceMin);
const priceTabTextMed = "Gift under <br>$" + numberWithCommas(priceMed);
const priceTabTextMax = "Gift under <br>$" + numberWithCommas(priceMax);
const b2bApi = `https://searchapi.samsung.com/v6/front/epp/v2/product/finder/`;

const BGmxApiUrl = BGmxCategoryCode.map(code => b2bApi + BestGiftProductApi +
    `?type=` + code + `&siteCode=` + bestGiftSite +
    `&start=1&num=10&sort=recommended&onlyFilterInfoYN=N&keySummaryYN=Y&specHighlightYN=Y&companyCode=` + BestGiftCompanyCode +
    `&pfType=G&familyId=`)
const BGdaApiUrl = BGdaCategoryCode.map(code => b2bApi + BestGiftProductApi +
    `?type=` + code + `&siteCode=` + bestGiftSite +
    `&start=1&num=10&sort=recommended&onlyFilterInfoYN=N&keySummaryYN=Y&specHighlightYN=Y&companyCode=` + BestGiftCompanyCode +
    `&pfType=G&familyId=`)
const BGvdApiUrl = BGvdCategoryCode.map(code => b2bApi + BestGiftProductApi +
    `?type=` + code + `&siteCode=` + bestGiftSite +
    `&start=1&num=10&sort=recommended&onlyFilterInfoYN=N&keySummaryYN=Y&specHighlightYN=Y&companyCode=` + BestGiftCompanyCode +
    `&pfType=G&familyId=`)

var bestGiftSku = [];
var skuCollection = [];
var bestGiftPos = '.ho-g-home-kv-carousel';
var bestGiftCtaText = "Buy now";
var bestGiftColorText = "Colour:"
var bestGiftTitle = "Black Friday gifts await!";
var bestGiftDesc = "Unwrap the best pick for you!";

initBestGiftProductCard();
async function initBestGiftProductCard() {
    await collectData();
    //console.log(skuCollection);
    customBGProductCardStyle();
    getBGProductInfo()
    let BGintervalCount = 0;
    let waitBGSku = setInterval(() => {
        if (bestGiftSku) {
            createBestGiftHtml(bestGiftSku);
        }

        if (BGintervalCount == 10) {
            clearInterval(waitBGSku);
        }

        if (document.querySelectorAll('#best__giftCard .offers-product-card-grid__item-wrap').length == 9) {
            handleBestGiftColorBtn();
            handleBestGiftSizeBtn();
            handlePopupClick();
            setTimeout(() => {
                initOptionSwiper();
            }, 500);
            setTimeout(() => {
                document.querySelector('.best__giftCard').style.display = 'block';
            }, 1000)
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 1500)
            clearInterval(waitBGSku);

        }

        BGintervalCount++;
    }, 500);
}


async function collectData() {
    const mxRes = await makeMultipleAPICalls(BGmxApiUrl);
    const daRes = await makeMultipleAPICalls(BGdaApiUrl);
    const vdRes = await makeMultipleAPICalls(BGvdApiUrl);
    filterResponse(mxRes, 0, priceMin, priceMed, priceMax);
    filterResponse(daRes, 1, priceMin, priceMed, priceMax);
    filterResponse(vdRes, 2, priceMin, priceMed, priceMax);
}

async function makeAPICall(endpoint) {
    const response = await fetch(endpoint);
    const data = await response.json();
    return data;
}

async function makeMultipleAPICalls(endpoints) {
    const promises = endpoints.map(makeAPICall);
    const responses = await Promise.all(promises);

    return responses;
}

function filterResponse(data, pos, min, med, max) {
    data.forEach(e => {
        let productList = e.response.resultData.productList;
        for (let i = 0; i < productList.length; i++) {
            let modelDetail = productList[i].modelList[0];
            let stockCheck = modelDetail.stockStatusText ? modelDetail.stockStatusText : "";
            let price = modelDetail.promotionPrice !== null ? modelDetail.promotionPrice : modelDetail.price;
            if (stockCheck.toLowerCase() === 'instock' || stockCheck.toLowerCase() === 'lowstock') {
                if (price < min && !skuCollection[pos]) {
                    skuCollection[pos] = modelDetail.modelCode;
                } else if (price > min && price < med && !skuCollection[pos + 3]) {
                    skuCollection[pos + 3] = modelDetail.modelCode;
                } else if (price > med && price < max && !skuCollection[pos + 6]) {
                    skuCollection[pos + 6] = modelDetail.modelCode;
                }
            }
        }
    });

}

function handlePopupClick() {
    // Init Popup
    for (let i = 0; i < bestGiftSku.length; i++) {
        let card = document.querySelectorAll('.best__giftCard .offers-product-card-grid__item-wrap')[i];
        handleBGOptionSelect(card, bestGiftSku[i].modelList[0].modelCode, i);
        if (i > 2) {
            card.classList.remove("is-show");
        }
    }
    // Price Tab change
    $("#gift-price-cta .cta").on('click', function (e) {
        $('#best__giftCard').fadeOut(0)
        $("#gift-price-cta .cta").removeClass('cta--contained');

        $(this).addClass('cta--contained');

        let card = document.querySelectorAll('.best__giftCard .offers-product-card-grid__item-wrap');
        for (let i = 0; i < card.length; i++) {
            card[i].classList.remove("is-show");
            if ($(this).attr("data-category") == "1" && i < 3) {
                card[i].classList.add("is-show");
            } else if ($(this).attr("data-category") == "2" && i > 2 && i < 6) {
                card[i].classList.add("is-show");
            } else if ($(this).attr("data-category") == "3" && i > 5) {
                card[i].classList.add("is-show");
            }
        }
        $('#best__giftCard').fadeIn(500)
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);

    });
}


function getBGProductInfo() {

    let atSkuList = skuCollection.join(',');
    let searchUrl = "https://searchapi.samsung.com/v6/front/epp/v2/product/card/detail/" + BestGiftProductApi + "?companyCode=" + BestGiftCompanyCode + "&shopSkuYN=N&siteCode=" + bestGiftSite + "&modelList=" + atSkuList + "&saleSkuYN=N&onlyRequestSkuYN=N";

    $.ajax({
        url: searchUrl,
        type: 'GET',
        dataType: 'json',
        cache: false,
        timeout: 20000,
        async: false,
        success: function (res) {
            if (res.response.statusCode === 200) {
                bestGiftSku = res.response.resultData.productList;
                return true;
            }
        },
        error: function (err) {
            console.log('Fail to fetch data ' + JSON.stringify(err))
        }
    });
}

function createBestGiftHtml(product) {
    let html = `
    <div class="EPP-CO02_TBC-19 cm-g-text-block-container">
                        <section class="text-block-container text-color--black " style="background: #FFFFFF">
                            <div class="text-block-container__title-wrap">
                                <div class="text-block-container__headline-wrap">
                                    <h2 class="text-block-container__headline">`+ bestGiftTitle + `</h2>
                                    <h3 class="textblock__title" data-font-size-pc="38" data-font-size-mo="26">`+ bestGiftDesc + `</h3>
                                </div>
                               
                            </div>
                        </section>
                        <div class="aem-Grid aem-Grid--12 aem-Grid--default--12 ">
                         
                        </div>
                    </div>
            <div id="gift-price-cta">
               <div class="flex justify-center">
                    <button type="button" class="cta  cta--black cta--contained " data-category="1" an-tr="rec_gift price-tab home-cta-button" an-ca="content click" an-ac="feature" an-la="best_gift price_cta: 1">`+ priceTabTextMin + `</button>
                    <button type="button" class="cta  cta--black" data-category="2" an-tr="rec_gift price-tab cta-epp home-cta-button" an-ca="content click" an-ac="feature" an-la="best_gift price_cta: 2">`+ priceTabTextMed + `</button>
                    <button type="button" class="cta  cta--black" data-category="3" an-tr="rec_gift price-tab cta-epp home-cta-button" an-ca="content click" an-ac="feature" an-la="best_gift price_cta: 3">`+ priceTabTextMax + `</button>
                </div>
            </div>
    <div id="best__giftCard" class="bestGift__swiper">
                    <div class="bestGift__swiper-container">
                    <div class="offers-product-card-grid__list bestGift__swiper-wrapper swiper-wrapper">`;
    let counter = 0;
    product.forEach(e => {

        html += `
                    <div class="offers-product-card-grid__item-wrap is-show is-fade bestGift__swiper-slide swiper-slide" data-productidx="`+ counter + `">
                        <div class="offers-product-card-grid__item offers-product-card-grid__item--non-shop">
                            ` + createBGThumbnail(e, counter) + `
                            <div class="offers-product-card-grid__contents ">
                                <div class="option-selector option-selector__color-text" style="height: 92px;">
                                ` + createBGColorText(e, counter) + `

                                    <div class="option-selector__wrap option-selector__wrap--color-chip" data-desktop-view="5"
                                        data-mobile-view="5">
                                        <div class="option-selector__swiper" style="width: 202px;">
                                            <div class="option-selector__swiper-container">
                                                <div class="option-selector__swiper-wrapper color-wrapper swiper-wrapper" style="" role="list">` + createBGColorOptions(e, counter) + `
                                                </div>
                                            </div>
                                        </div>
                                            <div class="swiper-button-prev"><svg class="icon" focusable="false" aria-hidden="true"><use xlink:href="#previous-regular" href="#previous-regular"></use></svg></div>
                                            <div class="swiper-button-next"><svg class="icon" focusable="false" aria-hidden="true"><use xlink:href="#next-regular" href="#next-regular"></use></svg></div>
                                    </div>
                                    <div class="option-selector__wrap option-selector__wrap--capacity" data-desktop-view="3"
                                        data-mobile-view="3">
                                        <div class="option-selector__swiper" style="width: 215px;">
                                            <div class="option-selector__swiper-container">
                                                <div class="option-selector__swiper-wrapper size-wrapper swiper-wrapper" style="" role="list">`+ createBGStorageOption(e, counter) + `
                                                    
                                                    
                                                </div>
                                            </div>

                                        </div>
                                        <div class="swiper-button-prev"><svg class="icon" focusable="false" aria-hidden="true"><use xlink:href="#previous-regular" href="#previous-regular"></use></svg></div>
                                        <div class="swiper-button-next"><svg class="icon" focusable="false" aria-hidden="true"><use xlink:href="#next-regular" href="#next-regular"></use></svg></div>
                                    </div>
                                </div>
                                <div class="offers-product-card-grid__fiche" style="height: 0px;"></div>
                                <div class="offers-product-card-grid__price">
                                    <div class="offers-product-card-grid__price-current">
                                        <span class="hidden">Current Price: </span>
                                        <span class="offers-product-card-grid__price-current-payment">`+ BGhasPromotionPrice(e.modelList[0]) + `<span></span>
                                        </span>
                                    </div>`+ BGhasSavePrice(e.modelList[0], counter) + `
                                </div>
                                `+ BGcreateProductCTA(e, counter) + `

                            </div>
                        </div>
                    </div>
                `;

        counter++;
    });
    html += `</div>
        <div class="indicator dot-indicator">
            <div class="indicator-wrap">
                <div class="indicator__list-wrap">
                    <div class="indicator__list bestGift__swiper-pagination" role="tablist">
                    </div>
                </div>
            </div>
        </div>
    </div>`;
    if (document.querySelector('.best__giftCard')) {
        document.querySelector('.best__giftCard').remove();
    }
    const BGnewNode = document.createElement("div");
    BGnewNode.classList.add("best__giftCard");
    BGnewNode.style.display = 'none';
    BGnewNode.innerHTML = html;
    const containerNode = document.querySelector(bestGiftPos);
    containerNode.after(BGnewNode);
}

function BGhasPromotionPrice(product) {
    let price = "";
    if (product.hasOwnProperty('promotionPriceDisplay') && product.promotionPriceDisplay !== null) {
        price = product.promotionPriceDisplay;
    } else {
        price = product.priceDisplay;
    }
    return price;
}

function BGhasSavePrice(product) {
    let hasSave = false;
    let savePrice = "";

    if (product.hasOwnProperty('saveText')) {
        if (product.formattedPriceSave || product.saveText != "0" || product.saveText != null) {
            if (bestGiftSite == 'ua') {
                savePrice = `<del>` + product.saveText + `</del>`;
            } else {
                savePrice = product.saveText;
            }
        }
    }

    if (product.hasOwnProperty('promotionPriceDisplay')) {
        if (product.promotionPriceDisplay != "0" && product.promotionPriceDisplay != null) {
            savePrice = `<del>` + product.priceDisplay + `</del>`;
            hasSave = true;
        }
    }

    if (product.hasOwnProperty('formattedPriceSave')) {
        if (product.formattedPriceSave && product.formattedPriceSave != 0 && product.formattedPriceSave != null) {
            savePrice = product.formattedPriceSave;
            hasSave = true;
        }
    }

    if (parseFloat(product.promotionPrice) < parseFloat(product.price)) {
        hasSave = true;
    } else {
        hasSave = false;
    }

    if (hasSave == true) {
        return saveHtml = `<div class="offers-product-card-grid__price-next">
                                <span class="offers-product-card-grid__price-suggested">
                                    <span class="offers-product-card-grid__save-price">`+ savePrice + `</span>
                            </div>`;
    } else {
        return saveHtml = `<div class="offers-product-card-grid__price-next">
                                <span class="offers-product-card-grid__price-suggested">
                                    <span class="offers-product-card-grid__save-price"></span>
                            </div>`;
    }
}

function createBGThumbnail(product, counter) {
    let html = ""
    let CtaLink = "";
    let taggingNumber = parseInt(counter) + 1;
    let division = getDivision(taggingNumber);
    if (product.modelList[0].configuratorUseYn == 'Y') {
        CtaLink = product.modelList[0].configuratorUrl + '?modelCode=' + product.modelList[0].modelCode;
    } else {
        CtaLink = product.modelList[0].pdpUrl;
    }

    html = `<a class="offers-product-card-grid__name" href="` + CtaLink + `" title=""
                    data-modelcode="`+ product.modelList[0].modelCode + `" data-modelname="` + product.modelList[0].modelCode + `"
                    an-tr="best_gift_rec product card list-epp home-link to pd-home_content_click1" an-ca="home content click"
                    an-ac="offer product card" an-la="best_gift_card`+ taggingNumber + `:image click_` + division + `_` + product.modelList[0].modelCode + `" tabindex="0">` + product.modelList[0].displayName + `</a>
                <a class="offers-product-card-grid__image" href="`+ CtaLink + `" title=""
                    data-modelcode="`+ product.modelList[0].modelCode + `" data-modelname="` + product.modelList[0].modelCode + `"
                    an-tr="best_gift_rec product card list-epp home-link to pd-home_content_click1" an-ca="home content click"
                    an-ac="offer product card" an-la="best_gift_card`+ taggingNumber + `:image click_` + division + `_` + product.modelList[0].modelCode + `" tabindex="0">
                    <div class="image image--main-loaded">
                        <img class="image__preview image--loaded image--hide" alt="` + product.modelList[0].displayName + `" src="` + product.modelList[0].thumbUrl + `" aria-hidden="true">
                        <img class="image__main image--loaded" alt="` + product.modelList[0].displayName + `" src="` + product.modelList[0].thumbUrl + `" style="">
                    </div>
                </a>`;
    return html;
}

function getDivision(pos) {
    if (pos % 3 == 1) {
        return division = 'MX';
    } else if (pos % 3 == 2) {
        return division = 'DA';
    } else if (pos % 3 == 0) {
        return division = 'VD';
    }
}
function BGcreateProductCTA(product, counter) {
    let CtaHtml = ""
    let CtaLink = "";
    if (product.modelList[0].configuratorUseYn == 'Y') {
        CtaLink = product.modelList[0].configuratorUrl + '?modelCode=' + product.modelList[0].modelCode;
    } else {
        CtaLink = product.modelList[0].pdpUrl;
    }

    let taggingNumber = parseInt(counter) + 1;
    let division = getDivision(taggingNumber);

    CtaHtml = `<div class="offers-product-card-grid__button">
                    <a class="cta cta--contained cta--black " href="`+ CtaLink + `"
                        data-link_info="" data-config_info="`+ CtaLink + `"
                        data-pimsubtype="" data-pvitype="" data-pvisubtype=""
                        data-modelrevenue="" data-modelqty="1" data-modelcurrency=""
                        data-modelcode="`+ product.modelList[0].modelCode + `" data-modelname="` + product.modelList[0].modelName + `" data-modeldisplay="` + product.modelList[0].displayName + `"
                        data-discountprice="" aria-label="buy now `+ product.modelList[0].displayName + `"
                        an-tr="best_gift_card buy cta-epp home-cta-button" an-ca="buy cta" an-ac="buy now"
                        an-la="best_gift_rec card`+ taggingNumber + `:buy now_` + division + `_` + product.modelList[0].modelCode + `" tabindex="` + counter + `">` + bestGiftCtaText + `</a>
                </div>`;
    return CtaHtml;
}


function createBGStorageOption(product, position, color = "") {
    let optionHtml = "";
    let checkStorage = [];
    let checkExist = false;
    let skuWithColor = [];
    let itemCounter = 0;
    let hasColor = false;

    if (product.chipOptions == null) {
        return optionHtml;
    };

    if (color != "") {
        product.modelList.forEach(e => {
            for (let i = 0; i < e.fmyChipList.length; i++) {
                if (e.fmyChipList[i].fmyChipType == "COLOR" && e.fmyChipList[i].fmyChipName == color) {
                    skuWithColor.push(e);
                }
            }
        })

    } else {
        product.modelList.forEach(function (e, index, object) {
            for (let i = 0; i < e.fmyChipList.length; i++) {

                if (e.fmyChipList[i].fmyChipType == "COLOR" && e.fmyChipList[i].fmyChipName == product.modelList[0].fmyChipList[0].fmyChipName) {
                    skuWithColor.push(e);
                    hasColor = true;
                }

                if (e.fmyChipList[i].fmyChipType !== "OTHER" && e.fmyChipList[i].fmyChipType !== "COLOR" && hasColor == false) {
                    skuWithColor.push(e);
                }
            }
        })


    }

    if (position == 0 && skuWithColor.length > 1) {
        try {
            if (typeof (skuWithColor[0].fmyChipList[1].fmyChipCode) !== "undefined") {
                let compareStorage1 = parseInt(skuWithColor[0].fmyChipList[1].fmyChipCode);
                let compareStorage2 = parseInt(skuWithColor[1].fmyChipList[1].fmyChipCode);
                if (compareStorage1 !== 1 && compareStorage1 > compareStorage2) {
                    let temp = skuWithColor[0];
                    skuWithColor[0] = skuWithColor[1];
                    skuWithColor[1] = temp;
                }
            }
        } catch (e) {
            console.log(e);
        }

    }

    skuWithColor.forEach(x => {
        let z = {};
        for (let i = 0; i < x.fmyChipList.length; i++) {
            if (x.fmyChipList[i].fmyChipType !== "COLOR" && x.fmyChipList[i].fmyChipType !== "OTHER") {
                if (checkStorage.includes(x.fmyChipList[i].fmyChipCode)) {
                    checkExist = true;
                } else {
                    z = x.fmyChipList[i];
                    checkExist = false;
                }
            }
        }

        if (checkExist == false && z.hasOwnProperty('fmyChipType')) {
            let number = parseInt(position) + 1;
            let division = getDivision(number);
            optionHtml += `<span class="option-selector__swiper-slide swiper-slide" role="listitem">
                                <span class="option-selector__size" style="width:auto;">
                                    <input type="radio" id="offer-0-`+ x.modelCode + `-1-1"
                                        name="product-`+ x.modelCode + `-1-1" data-modeli="6"
                                        data-chiptype="other" data-modelcode="` + x.modelCode + `"
                                        data-modelname="`+ x.modelName + `"
                                        an-tr="best_gift_rec product card list-epp home-option-home_content_click1"
                                        an-ca="home content click" an-ac="offer product card"
                                        an-la='best_gift_card`+ number + `:` + z.fmyChipType + `:` + z.fmyChipName + `_` + division + `_` + x.modelCode + `'>
                                    <label class="option-selector__size-label"                                         name="product-`+ x.modelCode + `-1-1" data-modeli="6"
                                        data-chiptype="other" data-modelcode="` + x.modelCode + `"
                                        data-modelname="`+ x.modelName + `"
                                        an-tr="best_gift_rec product card list-epp home-option-home_content_click1"
                                        an-ca="home content click" an-ac="offer product card"
                                        an-la='best_gift_card`+ number + `:` + z.fmyChipType + `:` + z.fmyChipName + `_` + division + `_` + x.modelCode + `'>
                                        <span class="option-selector__size-label-text">`+ z.fmyChipLocalName + `<span></span>
                                        </span>
                                    </label>
                                </span>
                            </span>`;

            checkStorage.push(z.fmyChipCode);
        }

        itemCounter++;


    })

    return optionHtml;
}
function createBGColorText(product, cardIndex) {
    let optionHtml = "";
    let optionCounter = 0;
    let optionName = "";
    let optionColorCheck = false;
    if (product.chipOptions !== null) {
        for (let i = 0; i < product.chipOptions.length; i++) {
            if (product.chipOptions[i].fmyChipType == "COLOR") {
                optionColorCheck = true;
                optionName = product.chipOptions[i].optionList[0].optionLocalName;
                break;
            }
        }
    }
    if (optionColorCheck == true) {
        optionHtml += `<div class="option-selector__color-name">` + bestGiftColorText + `<span class="option-selector__color-name-text">
                                <strong class="option-selector__color-name-text-in">` + optionName + `</strong>
                            </span>
                            <div class="option-selector__color-tooltip" aria-hidden="true">>` + bestGiftColorText + ` : <strong
                                    class="option-selector__color-tooltip-text">` + optionName + `</strong>
                                <a href="javascript:void(0)" class="option-selector__color-tooltip-close" role="button"
                                    tabindex="0">
                                    <span class="hidden">Close</span>
                                    <svg class="icon icon-close" focusable="false" aria-hidden="true">
                                        <use xlink:href="#delete-bold" href="#delete-bold"></use>
                                    </svg>
                                </a>
                            </div>
                        </div>
        `;
    } else {
        optionHtml += `<div class="option-selector__color-name"><span class="option-selector__color-name-text">
                                <strong class="option-selector__color-name-text-in"></strong>
                            </span>
                            <div class="option-selector__color-tooltip" aria-hidden="true"><strong
                                    class="option-selector__color-tooltip-text"></strong>
                                <a href="javascript:void(0)" class="option-selector__color-tooltip-close" role="button"
                                    tabindex="0">
                                    <span class="hidden">Close</span>
                                    <svg class="icon icon-close" focusable="false" aria-hidden="true">
                                        <use xlink:href="#delete-bold" href="#delete-bold"></use>
                                    </svg>
                                </a>
                            </div>
                        </div>
        `;
    }

    return optionHtml;
}
function createBGColorOptions(product, position) {
    let optionHtml = "";
    let optionCounter = 0;
    let checkColorChip = false;
    let checkColor = [];

    if (product.chipOptions == null) {
        return optionHtml;
    }

    for (let i = 0; i < product.chipOptions.length; i++) {
        if (product.chipOptions[i].fmyChipType == "COLOR") {
            checkColorChip = true;
        }
    }

    if (checkColorChip == true) {
        product.modelList.forEach(x => {
            let number = parseInt(position) + 1;
            let division = getDivision(number);
            let colorChipCode = '';
            let colorChipName = '';
            for (let i = 0; i < product.chipOptions.length; i++) {
                if (product.chipOptions[i].fmyChipType == "COLOR") {
                    colorChipCode = x.fmyChipList[i].fmyChipCode;
                    colorChipName = x.fmyChipList[i].fmyChipName;
                    break;
                }
            }
            if (!checkColor.includes(colorChipCode)) {
                optionHtml += `<span class="option-selector__swiper-slide swiper-slide" role="listitem">
                        <span class="option-selector__color">
                            <input type="radio" id="best_gift_rec-color-`+ optionCounter + `-` + x.modelCode + `-1-1"
                                name="product-color-`+ x.modelCode + `-1-1"  data-modeli="0"
                                data-chiptype="color" data-modelcode="`+ x.modelCode + `"
                                data-modelname="`+ x.modelName + `"
                                an-tr="best_gift_rec product card list-epp home-option-home_content_click1"
                                an-ca="home content click" an-ac="offer product card"
                                an-la="best_gift_card`+ number + `:` + x.pviTypeName + ` COLOR:` + colorChipName + `_` + division + `_` + x.modelCode + `" tabindex="0">
                            <label class="label-for-color-option"  name="product-color-`+ x.modelCode + `-1-1"  data-modeli="0"
                                data-chiptype="color" data-modelcode="`+ x.modelCode + `"
                                data-modelname="`+ x.modelName + `"
                                an-tr="best_gift_rec product card list-epp home-option-home_content_click1"
                                an-ca="home content click" an-ac="offer product card"
                                an-la="best_gift_card`+ number + `:` + x.pviTypeName + ` COLOR:` + colorChipName + `_` + division + `_` + x.modelCode + `" tabindex="0">
                                <span class="option-selector__color-code">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"
                                        viewBox="0 0 36 36">
                                        <g transform="translate(-18.001 9)">
                                            <rect width="36" height="35.999"
                                                transform="translate(18.001 -9)" fill="none"></rect>
                                            <path d="M18,0A18,18,0,1,1,0,18,18,18,0,0,1,18,0Z"
                                                transform="translate(18.001 -9)" fill="`+ colorChipCode + `"></path>
                                            <path
                                                d="M18,1A17,17,0,0,0,5.979,30.019,17,17,0,1,0,30.02,5.979,16.889,16.889,0,0,0,18,1m0-1A18,18,0,1,1,0,18,18,18,0,0,1,18,0Z"
                                                transform="translate(18.001 -9)" fill="rgba(0,0,0,0.5)">
                                            </path>
                                        </g>
                                    </svg>
                                </span>
                                <span class="hidden">Titanium grey</span>
                            </label>
                        </span>
                    </span>
        `;
                checkColor.push(colorChipCode);
            }

            optionCounter++;
        });
    }


    return optionHtml;
}

function customBGProductCardStyle() {
    let newStyles = `#gift-price-cta .cta{border:1px solid rgba(0,0,0,.15);font-weight:400;padding:10px 24px 11px;border-radius:20px;display:inline-block;margin-right:8px;margin-bottom:8px;transition:opacity .2s cubic-bezier(.4, 0, .2, 1);text-align:center}#gift-price-cta .cta br,.bestGift__swiper-pagination,.best__giftCard .dot-indicator,.best__giftCard .offers-product-card-grid__fiche,.best__giftCard .offers-product-card-grid__rating,.best__giftCard .option-selector__swiper-slide is-disabled,.best__giftCard .pd-wishlist-cta.js-layer-open,.best__giftCard .swiper-button-disabled{display:none}.flex{display:flex}.justify-center{justify-content:center}.best__giftCard .swiper-button-next .icon,.swiper-button-prev .icon{display:inline-block;width:24px;height:24px;vertical-align:top}.best__giftCard .swiper-button-next:after,.swiper-button-prev:after{content:"";position:absolute;top:-1px;display:block;width:16px;height:28px}.best__giftCard .offers-product-card-grid__item-wrap{width:33%}.best__giftCard .swiper-button-next:after,.best__giftCard .swiper-button-prev:after{background:0 0}.bestGift__swiper-pagination .swiper-pagination-bullet-active{background-color:#000}.bestGift__swiper-pagination .swiper-pagination-bullet{margin:0 5px}.best__giftCard .offers-product-card-grid__image{width:75%;height:auto}.best__giftCard{width:100%;max-width:1440px;margin:auto;overflow:hidden}.best__giftCard .offers-product-card-grid__list{flex-wrap:unset;padding:0}.best__giftCard .storage-active{border-radius:14px;border:1px solid #000}.best__giftCard .option-selector__swiper-slide{cursor:pointer;}.best__giftCard .offers-product-card-grid__price{margin-top:1vw}.best__giftCard .offers-product-card-grid__name{height:75px}.best__giftCard .option-selector__size label{margin-bottom:0}.best__giftCard .option-selector__size{width:auto}.best__giftCard .option-selector__size .option-selector__size-label{padding:0 4px;min-width:36px}.best__giftCard .option-selector__swiper-wrapper{padding:1px 0}.best__giftCard .swiper-pagination-bullets{text-align:center}.best__giftCard .textblock__title{margin:30px 0 15px;font-size:24px}@media only screen and (max-width:768px){#gift-price-cta .cta br,.bestGift__swiper-pagination{display:block}#gift-price-cta .cta{padding:3px 0px;border-radius:25px;margin:0 5px;width:30%;}.best__giftCard .textblock__title{margin:30px 0 15px;font-size:18px}.best__giftCard .offers-product-card-grid__item-wrap,.best__giftCard .option-selector__swiper{width:100%!important}.best__giftCard .dot-indicator{display:block;padding-top:15px}.best__giftCard .offers-product-card-grid__price{margin-top:17vw;height:30px}.best__giftCard .storage-active{border-radius:25px;border:1px solid #000}.best__giftCard .flex{display:flex;flex-wrap:wrap}.best__giftCard .bestGift__swiper{margin:15px 0}}@media only screen and (max-width:350px){.best__giftCard .offers-product-card-grid__price{margin-top:3vw;height:30px}}`;
    let newStyleSheet = document.createElement("style");
    newStyleSheet.innerText = newStyles;
    document.head.appendChild(newStyleSheet);
}


function handleBestGiftColorBtn() {
    document.querySelectorAll('.best__giftCard .label-for-color-option').forEach(e => {
        e.addEventListener('click', () => {
            let card = e.closest('.offers-product-card-grid__item-wrap');
            let cardIndex = e.closest('.offers-product-card-grid__item-wrap').getAttribute('data-productidx');
            let sku = e.parentNode.querySelector('input').getAttribute('data-modelcode');
            bestGiftSku[cardIndex].modelList.forEach(e => {
                if (e.modelCode == sku) {
                    let title = card.querySelector('.offers-product-card-grid__name');
                    title.innerHTML == e.displayName;
                    if (e.configuratorUseYn == 'Y') {
                        title.setAttribute('href', e.configuratorUrl + '?modelCode=' + e.modelCode);
                    } else {
                        title.setAttribute('href', e.pdpUrl);
                    }
                    title.setAttribute('data-modelcode', e.modelCode);
                    title.setAttribute('data-modelname', e.modelCode);

                    let displayPrice = card.querySelector('.offers-product-card-grid__price-current-payment');
                    if (e.hasOwnProperty('promotionPriceDisplay') && e.promotionPriceDisplay !== null) {
                        displayPrice.innerHTML = e.promotionPriceDisplay;
                    } else {
                        displayPrice.innerHTML = e.priceDisplay;
                    }


                    let imageDiv = card.querySelector('.offers-product-card-grid__image');
                    if (e.configuratorUseYn == 'Y') {
                        imageDiv.setAttribute('href', e.configuratorUrl + '?modelCode=' + e.modelCode);
                    } else {
                        imageDiv.setAttribute('href', e.pdpUrl);
                    }
                    let taggingNumber = parseInt(cardIndex) + 1;
                    let division = getDivision(taggingNumber);
                    imageDiv.setAttribute('an-la', 'best_gift_card' + taggingNumber + ':image click_' + division + `_` + e.modelCode + ``);
                    imageDiv.setAttribute('data-modelcode', e.modelCode);
                    imageDiv.setAttribute('data-modelname', e.modelCode);
                    let image = card.querySelector('.image__main');
                    image.setAttribute('src', e.thumbUrl);

                    let color = '';
                    let colorDisplayText = '';
                    for (let i = 0; i < e.fmyChipList.length; i++) {
                        if (e.fmyChipList[i].fmyChipType == "COLOR") {
                            color = e.fmyChipList[i].fmyChipName;
                            colorDisplayText = e.fmyChipList[i].fmyChipLocalName;
                        }
                    }

                    let colorText = card.querySelector('.option-selector__color-name-text-in');
                    colorText.innerHTML = colorDisplayText;

                    let saveText = card.querySelector('.offers-product-card-grid__save-price');
                    let savePrice = "";
                    let hasSave = false;

                    if (e.hasOwnProperty('saveText')) {
                        if (e.formattedPriceSave || e.saveText != "0") {
                            savePrice = e.saveText;
                            hasSave = true;
                        }
                    }
                    if (e.hasOwnProperty('promotionPriceDisplay') && e.promotionPriceDisplay !== null) {
                        savePrice = `<del>` + e.priceDisplay + `</del>`;
                        hasSave = true;
                    }
                    if (e.hasOwnProperty('formattedPriceSave')) {
                        if (e.formattedPriceSave || e.formattedPriceSave != 0) {
                            savePrice = e.formattedPriceSave;
                            hasSave = true;
                        }
                    }
                    if (parseFloat(e.promotionPrice) < parseFloat(e.price)) {
                        hasSave = true;
                    } else {
                        hasSave = false;
                    }
                    if (hasSave == true) {
                        saveText.innerHTML = savePrice;
                    } else {
                        saveText.innerHTML = '';
                    }

                    let storageWrapper = card.querySelector('.size-wrapper');

                    storageWrapper.innerHTML = createBGStorageOption(bestGiftSku[cardIndex], cardIndex, color);
                    handleBestGiftSizeBtn();
                    let buyCta = card.querySelector('.offers-product-card-grid__button a');
                    if (e.configuratorUseYn == 'Y') {
                        buyCta.setAttribute('href', e.configuratorUrl + '?modelCode=' + e.modelCode);
                    } else {
                        buyCta.setAttribute('href', e.pdpUrl);
                    }
                    buyCta.setAttribute('data-modelcode', e.modelCode);
                    buyCta.setAttribute('data-modelname', e.modelCode);
                    if (e.configuratorUseYn == 'Y') {
                        buyCta.setAttribute('data-config_info', e.configuratorUrl);
                    } else {
                        buyCta.setAttribute('data-config_info', e.pdpUrl);
                    }

                    buyCta.setAttribute('data-modeldisplay', e.displayName);
                    buyCta.setAttribute('aria-label', "buy now " + e.displayName);
                    buyCta.setAttribute('an-tr', "best_gift_rec buy cta-epp home-cta-button");
                    buyCta.setAttribute('an-la', `best_gift_rec card` + taggingNumber + `:buy now_` + division + `_` + e.modelCode + ``);
                    handleBGOptionSelect(card, sku, cardIndex);
                }

            })

            window.dispatchEvent(new Event('resize'));

        })
    })
}


function handleBestGiftSizeBtn() {
    document.querySelectorAll('.best__giftCard .option-selector__size-label').forEach(e => {
        e.addEventListener('click', () => {
            let card = e.closest('.offers-product-card-grid__item-wrap');
            let cardIndex = e.closest('.offers-product-card-grid__item-wrap').getAttribute('data-productidx');
            let sku = e.closest(`.option-selector__size`).querySelector('input').getAttribute('data-modelcode');

            bestGiftSku[cardIndex].modelList.forEach(e => {
                if (e.modelCode == sku) {
                    let title = card.querySelector('.offers-product-card-grid__name');
                    title.innerHTML = e.displayName;
                    if (e.configuratorUseYn == 'Y') {
                        title.setAttribute('href', e.configuratorUrl + '?modelCode=' + e.modelCode);
                    } else {
                        title.setAttribute('href', e.pdpUrl);
                    }
                    title.setAttribute('data-modelcode', e.modelCode);
                    title.setAttribute('data-modelname', e.modelCode);


                    let displayPrice = card.querySelector('.offers-product-card-grid__price-current-payment');
                    if (e.hasOwnProperty('promotionPriceDisplay') && e.promotionPriceDisplay !== null) {
                        displayPrice.innerHTML = e.promotionPriceDisplay;
                    } else {
                        displayPrice.innerHTML = e.priceDisplay;
                    }

                    let imageDiv = card.querySelector('.offers-product-card-grid__image');
                    if (e.configuratorUseYn == 'Y') {
                        imageDiv.setAttribute('href', e.configuratorUrl + '?modelCode=' + e.modelCode);
                    } else {
                        imageDiv.setAttribute('href', e.pdpUrl);
                    }

                    let taggingNumber = parseInt(cardIndex) + 1;
                    let division = getDivision(taggingNumber);
                    imageDiv.setAttribute('an-la', 'best_gift_card' + taggingNumber + ':image click_' + division + `_` + e.modelCode + ``);
                    imageDiv.setAttribute('data-modelcode', e.modelCode);
                    imageDiv.setAttribute('data-modelname', e.modelCode);

                    let image = card.querySelector('.image__main');
                    image.setAttribute('src', e.thumbUrl);

                    let saveText = card.querySelector('.offers-product-card-grid__save-price');
                    let savePrice = "";
                    let hasSave = false;

                    if (e.hasOwnProperty('saveText')) {
                        if (e.formattedPriceSave || e.saveText != "0") {
                            if (bestGiftSite == 'ua') {
                                savePrice = `<del>` + e.saveText + ` ₴</del>`;
                            } else {
                                savePrice = e.saveText;
                            }
                        }
                    }


                    if (e.hasOwnProperty('promotionPriceDisplay')) {
                        savePrice = `<del>` + e.priceDisplay + `</del>`;
                        hasSave = true;
                    }
                    if (e.hasOwnProperty('formattedPriceSave')) {
                        if (e.formattedPriceSave || e.formattedPriceSave != 0) {
                            savePrice = e.formattedPriceSave;
                            hasSave = true;
                        }
                    }
                    if (parseFloat(e.promotionPrice) < parseFloat(e.price)) {
                        hasSave = true;
                    } else {
                        hasSave = false;
                    }

                    if (hasSave == true) {
                        saveText.innerHTML = savePrice;
                    } else {
                        saveText.innerHTML = '';
                    }

                    let buyCta = card.querySelector('.offers-product-card-grid__button a');
                    if (e.configuratorUseYn == 'Y') {
                        buyCta.setAttribute('href', e.configuratorUrl + '?modelCode=' + e.modelCode);
                    } else {
                        buyCta.setAttribute('href', e.pdpUrl);
                    }
                    if (e.configuratorUseYn == 'Y') {
                        buyCta.setAttribute('data-config_info', e.configuratorUrl);
                    } else {
                        buyCta.setAttribute('data-config_info', e.pdpUrl);
                    }
                    buyCta.setAttribute('data-modelcode', e.modelCode);
                    buyCta.setAttribute('data-modelname', e.modelCode);
                    buyCta.setAttribute('data-modeldisplay', e.displayName);
                    buyCta.setAttribute('aria-label', "buy now " + e.displayName);
                    buyCta.setAttribute('an-tr', "best_gift_rec buy cta-epp home-cta-button");
                    buyCta.setAttribute('an-la', `best_gift_rec card` + taggingNumber + `:buy now_` + division + `_` + e.modelCode + ``);
                    handleBGOptionSelect(card, sku, cardIndex);
                }

            })

            window.dispatchEvent(new Event('resize'));

        })
    })
}

function handleBGOptionSelect(card, sku, index) {
    if (!card || !sku || typeof index === 'undefined') {
        console.warn('Missing required parameters in handleBGOptionSelect');
        return;
    }
    bestGiftSku[index].modelList.forEach(e => {
        if (e.modelCode == sku) {
            card.querySelectorAll('input').forEach(input => input.checked = false);
            card.querySelectorAll('.storage-active').forEach(element => { element.classList.remove('storage-active') });
            for (let i = 0; i < e.fmyChipList.length; i++) {
                if (e.fmyChipList[i].fmyChipType == "COLOR") {
                    let number = parseInt(index) + 1;
                    let division = getDivision(number);
                    let color = card.querySelector(`input[an-la*="best_gift_card` + number + `:` + e.pviTypeName + ` COLOR:` + e.fmyChipList[i].fmyChipName + `_` + division + `"]`);
                    color.checked = true;
                } else if (e.fmyChipList[i].fmyChipType !== "OTHER") {
                    let number = parseInt(index) + 1;
                    let division = getDivision(number);
                    let size = card.querySelector(`input[an-la*='best_gift_card` + number + `:` + e.fmyChipList[i].fmyChipType + `:` + e.fmyChipList[i].fmyChipName + `_` + division + `']`);
                    size.parentNode.classList.add('storage-active');
                }

            }

        }
    })
}

function initOptionSwiper() {
    const OPTION_SWIPER_CONFIG = {
        direction: 'horizontal',
        slidesPerView: 4,
        spaceBetween: 0,
        allowTouchMove: false
    };

    const BEST_GIFT_SWIPER_CONFIG = {
        direction: 'horizontal',
        slidesPerView: 1,
        spaceBetween: 5,
        allowTouchMove: true,
        pagination: {
            el: '.bestGift__swiper-pagination',
            type: 'bullets',
            clickable: true
        },
        breakpoints: {
            768: {
                slidesPerView: 3,
                allowTouchMove: true
            }
        }
    };
    const optionSwipers = document.querySelectorAll('.best__giftCard .option-selector__swiper-container');
    optionSwipers.forEach(swiperElement => {
        const parentContainer = swiperElement.parentElement.parentElement;
        const navigation = {
            nextEl: parentContainer.querySelector('.swiper-button-next'),
            prevEl: parentContainer.querySelector('.swiper-button-prev')
        };
        new Swiper(swiperElement, {
            ...OPTION_SWIPER_CONFIG,
            navigation
        });
    });
    const giftSlider = new Swiper('.bestGift__swiper-container', BEST_GIFT_SWIPER_CONFIG);

}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var isDesktop = false;
var isMobile = false;
if (window.innerWidth > 534) {
    isDesktop = true;
} else {
    isMobile = true;
}
window.addEventListener('resize', function (event) {
    if (window.innerWidth > 768 && isMobile == true) {
        isMobile = false;
        isDesktop = true;
    }
    if (window.innerWidth < 768 && isDesktop == true) {
        reInitElements();
        isDesktop = false;
        isMobile = true;
    }
}, true);

function reInitElements() {

    createBestGiftHtml(bestGiftSku);
    if (document.querySelectorAll('#best__giftCard .offers-product-card-grid__item-wrap').length == 9) {
        handleBestGiftColorBtn();
        handleBestGiftSizeBtn();
        handlePopupClick();
        setTimeout(() => {
            initOptionSwiper();
        }, 500);
        setTimeout(() => {
            document.querySelector('.best__giftCard').style.display = 'block';
        }, 1000)
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 1500)
    }
}