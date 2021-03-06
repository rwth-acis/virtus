/*! asn1-1.0.2.js (c) 2013 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
if (typeof KJUR == "undefined" || !KJUR) {
    KJUR = {}
}
if (typeof KJUR.asn1 == "undefined" || !KJUR.asn1) {
    KJUR.asn1 = {}
}
KJUR.asn1.ASN1Util = new function () {
    this.integerToByteHex = function (a) {
        var b = a.toString(16);
        if ((b.length % 2) == 1) {
            b = "0" + b
        }
        return b
    };
    this.bigIntToMinTwosComplementsHex = function (j) {
        var f = j.toString(16);
        if (f.substr(0, 1) != "-") {
            if (f.length % 2 == 1) {
                f = "0" + f
            } else {
                if (!f.match(/^[0-7]/)) {
                    f = "00" + f
                }
            }
        } else {
            var a = f.substr(1);
            var e = a.length;
            if (e % 2 == 1) {
                e += 1
            } else {
                if (!f.match(/^[0-7]/)) {
                    e += 2
                }
            }
            var g = "";
            for (var d = 0; d < e; d++) {
                g += "f"
            }
            var c = new BigInteger(g, 16);
            var b = c.xor(j).add(BigInteger.ONE);
            f = b.toString(16).replace(/^-/, "")
        }
        return f
    };
    this.getPEMStringFromHex = function (a, b) {
        var e = CryptoJS.enc.Hex.parse(a);
        var c = CryptoJS.enc.Base64.stringify(e);
        var d = c.replace(/(.{64})/g, "$1\r\n");
        d = d.replace(/\r\n$/, "");
        return "-----BEGIN " + b + "-----\r\n" + d + "\r\n-----END " + b + "-----\r\n"
    }
};
KJUR.asn1.ASN1Object = function () {
    var c = true;
    var b = null;
    var d = "00";
    var e = "00";
    var a = "";
    this.getLengthHexFromValue = function () {
        if (typeof this.hV == "undefined" || this.hV == null) {
            throw"this.hV is null or undefined."
        }
        if (this.hV.length % 2 == 1) {
            throw"value hex must be even length: n=" + a.length + ",v=" + this.hV
        }
        var i = this.hV.length / 2;
        var h = i.toString(16);
        if (h.length % 2 == 1) {
            h = "0" + h
        }
        if (i < 128) {
            return h
        } else {
            var g = h.length / 2;
            if (g > 15) {
                throw"ASN.1 length too long to represent by 8x: n = " + i.toString(16)
            }
            var f = 128 + g;
            return f.toString(16) + h
        }
    };
    this.getEncodedHex = function () {
        if (this.hTLV == null || this.isModified) {
            this.hV = this.getFreshValueHex();
            this.hL = this.getLengthHexFromValue();
            this.hTLV = this.hT + this.hL + this.hV;
            this.isModified = false
        }
        return this.hTLV
    };
    this.getValueHex = function () {
        this.getEncodedHex();
        return this.hV
    };
    this.getFreshValueHex = function () {
        return ""
    }
};
KJUR.asn1.DERAbstractString = function (c) {
    KJUR.asn1.DERAbstractString.superclass.constructor.call(this);
    var b = null;
    var a = null;
    this.getString = function () {
        return this.s
    };
    this.setString = function (d) {
        this.hTLV = null;
        this.isModified = true;
        this.s = d;
        this.hV = stohex(this.s)
    };
    this.setStringHex = function (d) {
        this.hTLV = null;
        this.isModified = true;
        this.s = null;
        this.hV = d
    };
    this.getFreshValueHex = function () {
        return this.hV
    };
    if (typeof c != "undefined") {
        if (typeof c.str != "undefined") {
            this.setString(c.str)
        } else {
            if (typeof c.hex != "undefined") {
                this.setStringHex(c.hex)
            }
        }
    }
};
YAHOO.lang.extend(KJUR.asn1.DERAbstractString, KJUR.asn1.ASN1Object);
KJUR.asn1.DERAbstractTime = function (c) {
    KJUR.asn1.DERAbstractTime.superclass.constructor.call(this);
    var b = null;
    var a = null;
    this.localDateToUTC = function (f) {
        utc = f.getTime() + (f.getTimezoneOffset() * 60000);
        var e = new Date(utc);
        return e
    };
    this.formatDate = function (j, l) {
        var e = this.zeroPadding;
        var k = this.localDateToUTC(j);
        var m = String(k.getFullYear());
        if (l == "utc") {
            m = m.substr(2, 2)
        }
        var i = e(String(k.getMonth() + 1), 2);
        var n = e(String(k.getDate()), 2);
        var f = e(String(k.getHours()), 2);
        var g = e(String(k.getMinutes()), 2);
        var h = e(String(k.getSeconds()), 2);
        return m + i + n + f + g + h + "Z"
    };
    this.zeroPadding = function (e, d) {
        if (e.length >= d) {
            return e
        }
        return new Array(d - e.length + 1).join("0") + e
    };
    this.getString = function () {
        return this.s
    };
    this.setString = function (d) {
        this.hTLV = null;
        this.isModified = true;
        this.s = d;
        this.hV = stohex(this.s)
    };
    this.setByDateValue = function (h, j, e, d, f, g) {
        var i = new Date(Date.UTC(h, j - 1, e, d, f, g, 0));
        this.setByDate(i)
    };
    this.getFreshValueHex = function () {
        return this.hV
    }
};
YAHOO.lang.extend(KJUR.asn1.DERAbstractTime, KJUR.asn1.ASN1Object);
KJUR.asn1.DERAbstractStructured = function (b) {
    KJUR.asn1.DERAbstractString.superclass.constructor.call(this);
    var a = null;
    this.setByASN1ObjectArray = function (c) {
        this.hTLV = null;
        this.isModified = true;
        this.asn1Array = c
    };
    this.appendASN1Object = function (c) {
        this.hTLV = null;
        this.isModified = true;
        this.asn1Array.push(c)
    };
    this.asn1Array = new Array();
    if (typeof b != "undefined") {
        if (typeof b.array != "undefined") {
            this.asn1Array = b.array
        }
    }
};
YAHOO.lang.extend(KJUR.asn1.DERAbstractStructured, KJUR.asn1.ASN1Object);
KJUR.asn1.DERBoolean = function () {
    KJUR.asn1.DERBoolean.superclass.constructor.call(this);
    this.hT = "01";
    this.hTLV = "0101ff"
};
YAHOO.lang.extend(KJUR.asn1.DERBoolean, KJUR.asn1.ASN1Object);
KJUR.asn1.DERInteger = function (a) {
    KJUR.asn1.DERInteger.superclass.constructor.call(this);
    this.hT = "02";
    this.setByBigInteger = function (b) {
        this.hTLV = null;
        this.isModified = true;
        this.hV = KJUR.asn1.ASN1Util.bigIntToMinTwosComplementsHex(b)
    };
    this.setByInteger = function (c) {
        var b = new BigInteger(String(c), 10);
        this.setByBigInteger(b)
    };
    this.setValueHex = function (b) {
        this.hV = b
    };
    this.getFreshValueHex = function () {
        return this.hV
    };
    if (typeof a != "undefined") {
        if (typeof a.bigint != "undefined") {
            this.setByBigInteger(a.bigint)
        } else {
            if (typeof a["int"] != "undefined") {
                this.setByInteger(a["int"])
            } else {
                if (typeof a.hex != "undefined") {
                    this.setValueHex(a.hex)
                }
            }
        }
    }
};
YAHOO.lang.extend(KJUR.asn1.DERInteger, KJUR.asn1.ASN1Object);
KJUR.asn1.DERBitString = function (a) {
    KJUR.asn1.DERBitString.superclass.constructor.call(this);
    this.hT = "03";
    this.setHexValueIncludingUnusedBits = function (b) {
        this.hTLV = null;
        this.isModified = true;
        this.hV = b
    };
    this.setUnusedBitsAndHexValue = function (b, d) {
        if (b < 0 || 7 < b) {
            throw"unused bits shall be from 0 to 7: u = " + b
        }
        var c = "0" + b;
        this.hTLV = null;
        this.isModified = true;
        this.hV = c + d
    };
    this.setByBinaryString = function (e) {
        e = e.replace(/0+$/, "");
        var f = 8 - e.length % 8;
        if (f == 8) {
            f = 0
        }
        for (var g = 0; g <= f; g++) {
            e += "0"
        }
        var j = "";
        for (var g = 0; g < e.length - 1; g += 8) {
            var d = e.substr(g, 8);
            var c = parseInt(d, 2).toString(16);
            if (c.length == 1) {
                c = "0" + c
            }
            j += c
        }
        this.hTLV = null;
        this.isModified = true;
        this.hV = "0" + f + j
    };
    this.setByBooleanArray = function (d) {
        var c = "";
        for (var b = 0; b < d.length; b++) {
            if (d[b] == true) {
                c += "1"
            } else {
                c += "0"
            }
        }
        this.setByBinaryString(c)
    };
    this.newFalseArray = function (d) {
        var b = new Array(d);
        for (var c = 0; c < d; c++) {
            b[c] = false
        }
        return b
    };
    this.getFreshValueHex = function () {
        return this.hV
    };
    if (typeof a != "undefined") {
        if (typeof a.hex != "undefined") {
            this.setHexValueIncludingUnusedBits(a.hex)
        } else {
            if (typeof a.bin != "undefined") {
                this.setByBinaryString(a.bin)
            } else {
                if (typeof a.array != "undefined") {
                    this.setByBooleanArray(a.array)
                }
            }
        }
    }
};
YAHOO.lang.extend(KJUR.asn1.DERBitString, KJUR.asn1.ASN1Object);
KJUR.asn1.DEROctetString = function (a) {
    KJUR.asn1.DEROctetString.superclass.constructor.call(this, a);
    this.hT = "04"
};
YAHOO.lang.extend(KJUR.asn1.DEROctetString, KJUR.asn1.DERAbstractString);
KJUR.asn1.DERNull = function () {
    KJUR.asn1.DERNull.superclass.constructor.call(this);
    this.hT = "05";
    this.hTLV = "0500"
};
YAHOO.lang.extend(KJUR.asn1.DERNull, KJUR.asn1.ASN1Object);
KJUR.asn1.DERObjectIdentifier = function (c) {
    var b = function (d) {
        var e = d.toString(16);
        if (e.length == 1) {
            e = "0" + e
        }
        return e
    };
    var a = function (k) {
        var j = "";
        var e = new BigInteger(k, 10);
        var d = e.toString(2);
        var f = 7 - d.length % 7;
        if (f == 7) {
            f = 0
        }
        var m = "";
        for (var g = 0; g < f; g++) {
            m += "0"
        }
        d = m + d;
        for (var g = 0; g < d.length - 1; g += 7) {
            var l = d.substr(g, 7);
            if (g != d.length - 7) {
                l = "1" + l
            }
            j += b(parseInt(l, 2))
        }
        return j
    };
    KJUR.asn1.DERObjectIdentifier.superclass.constructor.call(this);
    this.hT = "06";
    this.setValueHex = function (d) {
        this.hTLV = null;
        this.isModified = true;
        this.s = null;
        this.hV = d
    };
    this.setValueOidString = function (f) {
        if (!f.match(/^[0-9.]+$/)) {
            throw"malformed oid string: " + f
        }
        var g = "";
        var d = f.split(".");
        var j = parseInt(d[0]) * 40 + parseInt(d[1]);
        g += b(j);
        d.splice(0, 2);
        for (var e = 0; e < d.length; e++) {
            g += a(d[e])
        }
        this.hTLV = null;
        this.isModified = true;
        this.s = null;
        this.hV = g
    };
    this.setValueName = function (e) {
        if (typeof KJUR.asn1.x509.OID.name2oidList[e] != "undefined") {
            var d = KJUR.asn1.x509.OID.name2oidList[e];
            this.setValueOidString(d)
        } else {
            throw"DERObjectIdentifier oidName undefined: " + e
        }
    };
    this.getFreshValueHex = function () {
        return this.hV
    };
    if (typeof c != "undefined") {
        if (typeof c.oid != "undefined") {
            this.setValueOidString(c.oid)
        } else {
            if (typeof c.hex != "undefined") {
                this.setValueHex(c.hex)
            } else {
                if (typeof c.name != "undefined") {
                    this.setValueName(c.name)
                }
            }
        }
    }
};
YAHOO.lang.extend(KJUR.asn1.DERObjectIdentifier, KJUR.asn1.ASN1Object);
KJUR.asn1.DERUTF8String = function (a) {
    KJUR.asn1.DERUTF8String.superclass.constructor.call(this, a);
    this.hT = "0c"
};
YAHOO.lang.extend(KJUR.asn1.DERUTF8String, KJUR.asn1.DERAbstractString);
KJUR.asn1.DERNumericString = function (a) {
    KJUR.asn1.DERNumericString.superclass.constructor.call(this, a);
    this.hT = "12"
};
YAHOO.lang.extend(KJUR.asn1.DERNumericString, KJUR.asn1.DERAbstractString);
KJUR.asn1.DERPrintableString = function (a) {
    KJUR.asn1.DERPrintableString.superclass.constructor.call(this, a);
    this.hT = "13"
};
YAHOO.lang.extend(KJUR.asn1.DERPrintableString, KJUR.asn1.DERAbstractString);
KJUR.asn1.DERTeletexString = function (a) {
    KJUR.asn1.DERTeletexString.superclass.constructor.call(this, a);
    this.hT = "14"
};
YAHOO.lang.extend(KJUR.asn1.DERTeletexString, KJUR.asn1.DERAbstractString);
KJUR.asn1.DERIA5String = function (a) {
    KJUR.asn1.DERIA5String.superclass.constructor.call(this, a);
    this.hT = "16"
};
YAHOO.lang.extend(KJUR.asn1.DERIA5String, KJUR.asn1.DERAbstractString);
KJUR.asn1.DERUTCTime = function (a) {
    KJUR.asn1.DERUTCTime.superclass.constructor.call(this, a);
    this.hT = "17";
    this.setByDate = function (b) {
        this.hTLV = null;
        this.isModified = true;
        this.date = b;
        this.s = this.formatDate(this.date, "utc");
        this.hV = stohex(this.s)
    };
    if (typeof a != "undefined") {
        if (typeof a.str != "undefined") {
            this.setString(a.str)
        } else {
            if (typeof a.hex != "undefined") {
                this.setStringHex(a.hex)
            } else {
                if (typeof a.date != "undefined") {
                    this.setByDate(a.date)
                }
            }
        }
    }
};
YAHOO.lang.extend(KJUR.asn1.DERUTCTime, KJUR.asn1.DERAbstractTime);
KJUR.asn1.DERGeneralizedTime = function (a) {
    KJUR.asn1.DERGeneralizedTime.superclass.constructor.call(this, a);
    this.hT = "18";
    this.setByDate = function (b) {
        this.hTLV = null;
        this.isModified = true;
        this.date = b;
        this.s = this.formatDate(this.date, "gen");
        this.hV = stohex(this.s)
    };
    if (typeof a != "undefined") {
        if (typeof a.str != "undefined") {
            this.setString(a.str)
        } else {
            if (typeof a.hex != "undefined") {
                this.setStringHex(a.hex)
            } else {
                if (typeof a.date != "undefined") {
                    this.setByDate(a.date)
                }
            }
        }
    }
};
YAHOO.lang.extend(KJUR.asn1.DERGeneralizedTime, KJUR.asn1.DERAbstractTime);
KJUR.asn1.DERSequence = function (a) {
    KJUR.asn1.DERSequence.superclass.constructor.call(this, a);
    this.hT = "30";
    this.getFreshValueHex = function () {
        var c = "";
        for (var b = 0; b < this.asn1Array.length; b++) {
            var d = this.asn1Array[b];
            c += d.getEncodedHex()
        }
        this.hV = c;
        return this.hV
    }
};
YAHOO.lang.extend(KJUR.asn1.DERSequence, KJUR.asn1.DERAbstractStructured);
KJUR.asn1.DERSet = function (a) {
    KJUR.asn1.DERSet.superclass.constructor.call(this, a);
    this.hT = "31";
    this.getFreshValueHex = function () {
        var b = new Array();
        for (var c = 0; c < this.asn1Array.length; c++) {
            var d = this.asn1Array[c];
            b.push(d.getEncodedHex())
        }
        b.sort();
        this.hV = b.join("");
        return this.hV
    }
};
YAHOO.lang.extend(KJUR.asn1.DERSet, KJUR.asn1.DERAbstractStructured);
KJUR.asn1.DERTaggedObject = function (a) {
    KJUR.asn1.DERTaggedObject.superclass.constructor.call(this);
    this.hT = "a0";
    this.hV = "";
    this.isExplicit = true;
    this.asn1Object = null;
    this.setASN1Object = function (b, c, d) {
        this.hT = c;
        this.isExplicit = b;
        this.asn1Object = d;
        if (this.isExplicit) {
            this.hV = this.asn1Object.getEncodedHex();
            this.hTLV = null;
            this.isModified = true
        } else {
            this.hV = null;
            this.hTLV = d.getEncodedHex();
            this.hTLV = this.hTLV.replace(/^../, c);
            this.isModified = false
        }
    };
    this.getFreshValueHex = function () {
        return this.hV
    };
    if (typeof a != "undefined") {
        if (typeof a.tag != "undefined") {
            this.hT = a.tag
        }
        if (typeof a.explicit != "undefined") {
            this.isExplicit = a.explicit
        }
        if (typeof a.obj != "undefined") {
            this.asn1Object = a.obj;
            this.setASN1Object(this.isExplicit, this.hT, this.asn1Object)
        }
    }
};
YAHOO.lang.extend(KJUR.asn1.DERTaggedObject, KJUR.asn1.ASN1Object);
/*! asn1hex-1.1.2.js (c) 2012-2013 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
var ASN1HEX = new function () {
    this.getByteLengthOfL_AtObj = function (b, c) {
        if (b.substring(c + 2, c + 3) != "8") {
            return 1
        }
        var a = parseInt(b.substring(c + 3, c + 4));
        if (a == 0) {
            return -1
        }
        if (0 < a && a < 10) {
            return a + 1
        }
        return -2
    };
    this.getHexOfL_AtObj = function (b, c) {
        var a = this.getByteLengthOfL_AtObj(b, c);
        if (a < 1) {
            return ""
        }
        return b.substring(c + 2, c + 2 + a * 2)
    };
    this.getIntOfL_AtObj = function (c, d) {
        var b = this.getHexOfL_AtObj(c, d);
        if (b == "") {
            return -1
        }
        var a;
        if (parseInt(b.substring(0, 1)) < 8) {
            a = new BigInteger(b, 16)
        } else {
            a = new BigInteger(b.substring(2), 16)
        }
        return a.intValue()
    };
    this.getStartPosOfV_AtObj = function (b, c) {
        var a = this.getByteLengthOfL_AtObj(b, c);
        if (a < 0) {
            return a
        }
        return c + (a + 1) * 2
    };
    this.getHexOfV_AtObj = function (c, d) {
        var b = this.getStartPosOfV_AtObj(c, d);
        var a = this.getIntOfL_AtObj(c, d);
        return c.substring(b, b + a * 2)
    };
    this.getHexOfTLV_AtObj = function (c, e) {
        var b = c.substr(e, 2);
        var d = this.getHexOfL_AtObj(c, e);
        var a = this.getHexOfV_AtObj(c, e);
        return b + d + a
    };
    this.getPosOfNextSibling_AtObj = function (c, d) {
        var b = this.getStartPosOfV_AtObj(c, d);
        var a = this.getIntOfL_AtObj(c, d);
        return b + a * 2
    };
    this.getPosArrayOfChildren_AtObj = function (f, j) {
        var c = new Array();
        var i = this.getStartPosOfV_AtObj(f, j);
        c.push(i);
        var b = this.getIntOfL_AtObj(f, j);
        var g = i;
        var d = 0;
        while (1) {
            var e = this.getPosOfNextSibling_AtObj(f, g);
            if (e == null || (e - i >= (b * 2))) {
                break
            }
            if (d >= 200) {
                break
            }
            c.push(e);
            g = e;
            d++
        }
        return c
    };
    this.getNthChildIndex_AtObj = function (d, b, e) {
        var c = this.getPosArrayOfChildren_AtObj(d, b);
        return c[e]
    };
    this.getDecendantIndexByNthList = function (e, d, c) {
        if (c.length == 0) {
            return d
        }
        var f = c.shift();
        var b = this.getPosArrayOfChildren_AtObj(e, d);
        return this.getDecendantIndexByNthList(e, b[f], c)
    };
    this.getDecendantHexTLVByNthList = function (d, c, b) {
        var a = this.getDecendantIndexByNthList(d, c, b);
        return this.getHexOfTLV_AtObj(d, a)
    };
    this.getDecendantHexVByNthList = function (d, c, b) {
        var a = this.getDecendantIndexByNthList(d, c, b);
        return this.getHexOfV_AtObj(d, a)
    }
};
/*! asn1x509-1.0.4.js (c) 2013 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
if (typeof KJUR == "undefined" || !KJUR) {
    KJUR = {}
}
if (typeof KJUR.asn1 == "undefined" || !KJUR.asn1) {
    KJUR.asn1 = {}
}
if (typeof KJUR.asn1.x509 == "undefined" || !KJUR.asn1.x509) {
    KJUR.asn1.x509 = {}
}
KJUR.asn1.x509.Certificate = function (f) {
    KJUR.asn1.x509.Certificate.superclass.constructor.call(this);
    var a = null;
    var c = null;
    var e = null;
    var b = null;
    var d = null;
    this.setRsaPrvKeyByPEMandPass = function (h, j) {
        var g = PKCS5PKEY.getDecryptedKeyHex(h, j);
        var i = new RSAKey();
        i.readPrivateKeyFromASN1HexString(g);
        this.rsaPrvKey = i
    };
    this.sign = function () {
        this.asn1SignatureAlg = this.asn1TBSCert.asn1SignatureAlg;
        sig = new KJUR.crypto.Signature({alg: "SHA1withRSA", prov: "cryptojs/jsrsa"});
        sig.initSign(this.rsaPrvKey);
        sig.updateHex(this.asn1TBSCert.getEncodedHex());
        this.hexSig = sig.sign();
        this.asn1Sig = new KJUR.asn1.DERBitString({hex: "00" + this.hexSig});
        var g = new KJUR.asn1.DERSequence({array: [this.asn1TBSCert, this.asn1SignatureAlg, this.asn1Sig]});
        this.hTLV = g.getEncodedHex();
        this.isModified = false
    };
    this.getEncodedHex = function () {
        if (this.isModified == false && this.hTLV != null) {
            return this.hTLV
        }
        throw"not signed yet"
    };
    this.getPEMString = function () {
        var i = this.getEncodedHex();
        var g = CryptoJS.enc.Hex.parse(i);
        var h = CryptoJS.enc.Base64.stringify(g);
        var j = h.replace(/(.{64})/g, "$1\r\n");
        return "-----BEGIN CERTIFICATE-----\r\n" + j + "\r\n-----END CERTIFICATE-----\r\n"
    };
    if (typeof f != "undefined") {
        if (typeof f.tbscertobj != "undefined") {
            this.asn1TBSCert = f.tbscertobj
        }
        if (typeof f.rsaprvkey != "undefined") {
            this.rsaPrvKey = f.rsaprvkey
        }
        if ((typeof f.rsaprvpem != "undefined") && (typeof f.rsaprvpas != "undefined")) {
            this.setRsaPrvKeyByPEMandPass(f.rsaprvpem, f.rsaprvpas)
        }
    }
};
YAHOO.lang.extend(KJUR.asn1.x509.Certificate, KJUR.asn1.ASN1Object);
KJUR.asn1.x509.TBSCertificate = function (a) {
    KJUR.asn1.x509.TBSCertificate.superclass.constructor.call(this);
    this._initialize = function () {
        this.asn1Array = new Array();
        this.asn1Version = new KJUR.asn1.DERTaggedObject({obj: new KJUR.asn1.DERInteger({"int": 2})});
        this.asn1SerialNumber = null;
        this.asn1SignatureAlg = null;
        this.asn1Issuer = null;
        this.asn1NotBefore = null;
        this.asn1NotAfter = null;
        this.asn1Subject = null;
        this.asn1SubjPKey = null;
        this.extensionsArray = new Array()
    };
    this.setSerialNumberByParam = function (b) {
        this.asn1SerialNumber = new KJUR.asn1.DERInteger(b)
    };
    this.setSignatureAlgByParam = function (b) {
        this.asn1SignatureAlg = new KJUR.asn1.x509.AlgorithmIdentifier(b)
    };
    this.setIssuerByParam = function (b) {
        this.asn1Issuer = new KJUR.asn1.x509.X500Name(b)
    };
    this.setNotBeforeByParam = function (b) {
        this.asn1NotBefore = new KJUR.asn1.x509.Time(b)
    };
    this.setNotAfterByParam = function (b) {
        this.asn1NotAfter = new KJUR.asn1.x509.Time(b)
    };
    this.setSubjectByParam = function (b) {
        this.asn1Subject = new KJUR.asn1.x509.X500Name(b)
    };
    this.setSubjectPublicKeyByParam = function (b) {
        this.asn1SubjPKey = new KJUR.asn1.x509.SubjectPublicKeyInfo(b)
    };
    this.appendExtension = function (b) {
        this.extensionsArray.push(b)
    };
    this.getEncodedHex = function () {
        if (this.asn1NotBefore == null || this.asn1NotAfter == null) {
            throw"notBefore and/or notAfter not set"
        }
        var c = new KJUR.asn1.DERSequence({array: [this.asn1NotBefore, this.asn1NotAfter]});
        this.asn1Array = new Array();
        this.asn1Array.push(this.asn1Version);
        this.asn1Array.push(this.asn1SerialNumber);
        this.asn1Array.push(this.asn1SignatureAlg);
        this.asn1Array.push(this.asn1Issuer);
        this.asn1Array.push(c);
        this.asn1Array.push(this.asn1Subject);
        this.asn1Array.push(this.asn1SubjPKey);
        if (this.extensionsArray.length > 0) {
            var d = new KJUR.asn1.DERSequence({array: this.extensionsArray});
            var b = new KJUR.asn1.DERTaggedObject({explicit: true, tag: "a3", obj: d});
            this.asn1Array.push(b)
        }
        var e = new KJUR.asn1.DERSequence({array: this.asn1Array});
        this.hTLV = e.getEncodedHex();
        this.isModified = false;
        return this.hTLV
    };
    this._initialize()
};
YAHOO.lang.extend(KJUR.asn1.x509.TBSCertificate, KJUR.asn1.ASN1Object);
KJUR.asn1.x509.Extension = function (b) {
    KJUR.asn1.x509.Extension.superclass.constructor.call(this);
    var a = null;
    this.getEncodedHex = function () {
        var f = new KJUR.asn1.DERObjectIdentifier({oid: this.oid});
        var e = new KJUR.asn1.DEROctetString({hex: this.getExtnValueHex()});
        var d = new Array();
        d.push(f);
        if (this.critical) {
            d.push(new KJUR.asn1.DERBoolean())
        }
        d.push(e);
        var c = new KJUR.asn1.DERSequence({array: d});
        return c.getEncodedHex()
    };
    this.critical = false;
    if (typeof b != "undefined") {
        if (typeof b.critical != "undefined") {
            this.critical = b.critical
        }
    }
};
YAHOO.lang.extend(KJUR.asn1.x509.Extension, KJUR.asn1.ASN1Object);
KJUR.asn1.x509.KeyUsage = function (a) {
    KJUR.asn1.x509.KeyUsage.superclass.constructor.call(this, a);
    this.getExtnValueHex = function () {
        return this.asn1ExtnValue.getEncodedHex()
    };
    this.oid = "2.5.29.15";
    if (typeof a != "undefined") {
        if (typeof a.bin != "undefined") {
            this.asn1ExtnValue = new KJUR.asn1.DERBitString(a)
        }
    }
};
YAHOO.lang.extend(KJUR.asn1.x509.KeyUsage, KJUR.asn1.x509.Extension);
KJUR.asn1.x509.BasicConstraints = function (c) {
    KJUR.asn1.x509.BasicConstraints.superclass.constructor.call(this, c);
    var a = false;
    var b = -1;
    this.getExtnValueHex = function () {
        var e = new Array();
        if (this.cA) {
            e.push(new KJUR.asn1.DERBoolean())
        }
        if (this.pathLen > -1) {
            e.push(new KJUR.asn1.DERInteger({"int": this.pathLen}))
        }
        var d = new KJUR.asn1.DERSequence({array: e});
        this.asn1ExtnValue = d;
        return this.asn1ExtnValue.getEncodedHex()
    };
    this.oid = "2.5.29.19";
    this.cA = false;
    this.pathLen = -1;
    if (typeof c != "undefined") {
        if (typeof c.cA != "undefined") {
            this.cA = c.cA
        }
        if (typeof c.pathLen != "undefined") {
            this.pathLen = c.pathLen
        }
    }
};
YAHOO.lang.extend(KJUR.asn1.x509.BasicConstraints, KJUR.asn1.x509.Extension);
KJUR.asn1.x509.CRLDistributionPoints = function (a) {
    KJUR.asn1.x509.CRLDistributionPoints.superclass.constructor.call(this, a);
    this.getExtnValueHex = function () {
        return this.asn1ExtnValue.getEncodedHex()
    };
    this.setByDPArray = function (b) {
        this.asn1ExtnValue = new KJUR.asn1.DERSequence({array: b})
    };
    this.setByOneURI = function (e) {
        var b = new KJUR.asn1.x509.GeneralNames([{uri: e}]);
        var d = new KJUR.asn1.x509.DistributionPointName(b);
        var c = new KJUR.asn1.x509.DistributionPoint({dpobj: d});
        this.setByDPArray([c])
    };
    this.oid = "2.5.29.31";
    if (typeof a != "undefined") {
        if (typeof a.array != "undefined") {
            this.setByDPArray(a.array)
        } else {
            if (typeof a.uri != "undefined") {
                this.setByOneURI(a.uri)
            }
        }
    }
};
YAHOO.lang.extend(KJUR.asn1.x509.CRLDistributionPoints, KJUR.asn1.x509.Extension);
KJUR.asn1.x509.ExtKeyUsage = function (a) {
    KJUR.asn1.x509.ExtKeyUsage.superclass.constructor.call(this, a);
    this.setPurposeArray = function (b) {
        this.asn1ExtnValue = new KJUR.asn1.DERSequence();
        for (var c = 0; c < b.length; c++) {
            var d = new KJUR.asn1.DERObjectIdentifier(b[c]);
            this.asn1ExtnValue.appendASN1Object(d)
        }
    };
    this.getExtnValueHex = function () {
        return this.asn1ExtnValue.getEncodedHex()
    };
    this.oid = "2.5.29.37";
    if (typeof a != "undefined") {
        if (typeof a.array != "undefined") {
            this.setPurposeArray(a.array)
        }
    }
};
YAHOO.lang.extend(KJUR.asn1.x509.ExtKeyUsage, KJUR.asn1.x509.Extension);
KJUR.asn1.x509.CRL = function (f) {
    KJUR.asn1.x509.CRL.superclass.constructor.call(this);
    var a = null;
    var c = null;
    var e = null;
    var b = null;
    var d = null;
    this.setRsaPrvKeyByPEMandPass = function (h, j) {
        var g = PKCS5PKEY.getDecryptedKeyHex(h, j);
        var i = new RSAKey();
        i.readPrivateKeyFromASN1HexString(g);
        this.rsaPrvKey = i
    };
    this.sign = function () {
        this.asn1SignatureAlg = this.asn1TBSCertList.asn1SignatureAlg;
        sig = new KJUR.crypto.Signature({alg: "SHA1withRSA", prov: "cryptojs/jsrsa"});
        sig.initSign(this.rsaPrvKey);
        sig.updateHex(this.asn1TBSCertList.getEncodedHex());
        this.hexSig = sig.sign();
        this.asn1Sig = new KJUR.asn1.DERBitString({hex: "00" + this.hexSig});
        var g = new KJUR.asn1.DERSequence({array: [this.asn1TBSCertList, this.asn1SignatureAlg, this.asn1Sig]});
        this.hTLV = g.getEncodedHex();
        this.isModified = false
    };
    this.getEncodedHex = function () {
        if (this.isModified == false && this.hTLV != null) {
            return this.hTLV
        }
        throw"not signed yet"
    };
    this.getPEMString = function () {
        var i = this.getEncodedHex();
        var g = CryptoJS.enc.Hex.parse(i);
        var h = CryptoJS.enc.Base64.stringify(g);
        var j = h.replace(/(.{64})/g, "$1\r\n");
        return "-----BEGIN X509 CRL-----\r\n" + j + "\r\n-----END X509 CRL-----\r\n"
    };
    if (typeof f != "undefined") {
        if (typeof f.tbsobj != "undefined") {
            this.asn1TBSCertList = f.tbsobj
        }
        if (typeof f.rsaprvkey != "undefined") {
            this.rsaPrvKey = f.rsaprvkey
        }
        if ((typeof f.rsaprvpem != "undefined") && (typeof f.rsaprvpas != "undefined")) {
            this.setRsaPrvKeyByPEMandPass(f.rsaprvpem, f.rsaprvpas)
        }
    }
};
YAHOO.lang.extend(KJUR.asn1.x509.CRL, KJUR.asn1.ASN1Object);
KJUR.asn1.x509.TBSCertList = function (b) {
    KJUR.asn1.x509.TBSCertList.superclass.constructor.call(this);
    var a = null;
    this.setSignatureAlgByParam = function (c) {
        this.asn1SignatureAlg = new KJUR.asn1.x509.AlgorithmIdentifier(c)
    };
    this.setIssuerByParam = function (c) {
        this.asn1Issuer = new KJUR.asn1.x509.X500Name(c)
    };
    this.setThisUpdateByParam = function (c) {
        this.asn1ThisUpdate = new KJUR.asn1.x509.Time(c)
    };
    this.setNextUpdateByParam = function (c) {
        this.asn1NextUpdate = new KJUR.asn1.x509.Time(c)
    };
    this.addRevokedCert = function (c, d) {
        var f = {};
        if (c != undefined && c != null) {
            f.sn = c
        }
        if (d != undefined && d != null) {
            f.time = d
        }
        var e = new KJUR.asn1.x509.CRLEntry(f);
        this.aRevokedCert.push(e)
    };
    this.getEncodedHex = function () {
        this.asn1Array = new Array();
        if (this.asn1Version != null) {
            this.asn1Array.push(this.asn1Version)
        }
        this.asn1Array.push(this.asn1SignatureAlg);
        this.asn1Array.push(this.asn1Issuer);
        this.asn1Array.push(this.asn1ThisUpdate);
        if (this.asn1NextUpdate != null) {
            this.asn1Array.push(this.asn1NextUpdate)
        }
        if (this.aRevokedCert.length > 0) {
            var c = new KJUR.asn1.DERSequence({array: this.aRevokedCert});
            this.asn1Array.push(c)
        }
        var d = new KJUR.asn1.DERSequence({array: this.asn1Array});
        this.hTLV = d.getEncodedHex();
        this.isModified = false;
        return this.hTLV
    };
    this._initialize = function () {
        this.asn1Version = null;
        this.asn1SignatureAlg = null;
        this.asn1Issuer = null;
        this.asn1ThisUpdate = null;
        this.asn1NextUpdate = null;
        this.aRevokedCert = new Array()
    };
    this._initialize()
};
YAHOO.lang.extend(KJUR.asn1.x509.TBSCertList, KJUR.asn1.ASN1Object);
KJUR.asn1.x509.CRLEntry = function (c) {
    KJUR.asn1.x509.CRLEntry.superclass.constructor.call(this);
    var b = null;
    var a = null;
    this.setCertSerial = function (d) {
        this.sn = new KJUR.asn1.DERInteger(d)
    };
    this.setRevocationDate = function (d) {
        this.time = new KJUR.asn1.x509.Time(d)
    };
    this.getEncodedHex = function () {
        var d = new KJUR.asn1.DERSequence({array: [this.sn, this.time]});
        this.TLV = d.getEncodedHex();
        return this.TLV
    };
    if (typeof c != "undefined") {
        if (typeof c.time != "undefined") {
            this.setRevocationDate(c.time)
        }
        if (typeof c.sn != "undefined") {
            this.setCertSerial(c.sn)
        }
    }
};
YAHOO.lang.extend(KJUR.asn1.x509.CRLEntry, KJUR.asn1.ASN1Object);
KJUR.asn1.x509.X500Name = function (a) {
    KJUR.asn1.x509.X500Name.superclass.constructor.call(this);
    this.asn1Array = new Array();
    this.setByString = function (b) {
        var c = b.split("/");
        c.shift();
        for (var d = 0; d < c.length; d++) {
            this.asn1Array.push(new KJUR.asn1.x509.RDN({str: c[d]}))
        }
    };
    this.getEncodedHex = function () {
        var b = new KJUR.asn1.DERSequence({array: this.asn1Array});
        this.TLV = b.getEncodedHex();
        return this.TLV
    };
    if (typeof a != "undefined") {
        if (typeof a.str != "undefined") {
            this.setByString(a.str)
        }
    }
};
YAHOO.lang.extend(KJUR.asn1.x509.X500Name, KJUR.asn1.ASN1Object);
KJUR.asn1.x509.RDN = function (a) {
    KJUR.asn1.x509.RDN.superclass.constructor.call(this);
    this.asn1Array = new Array();
    this.addByString = function (b) {
        this.asn1Array.push(new KJUR.asn1.x509.AttributeTypeAndValue({str: b}))
    };
    this.getEncodedHex = function () {
        var b = new KJUR.asn1.DERSet({array: this.asn1Array});
        this.TLV = b.getEncodedHex();
        return this.TLV
    };
    if (typeof a != "undefined") {
        if (typeof a.str != "undefined") {
            this.addByString(a.str)
        }
    }
};
YAHOO.lang.extend(KJUR.asn1.x509.RDN, KJUR.asn1.ASN1Object);
KJUR.asn1.x509.AttributeTypeAndValue = function (b) {
    KJUR.asn1.x509.AttributeTypeAndValue.superclass.constructor.call(this);
    var d = null;
    var c = null;
    var a = "utf8";
    this.setByString = function (e) {
        if (e.match(/^([^=]+)=(.+)$/)) {
            this.setByAttrTypeAndValueStr(RegExp.$1, RegExp.$2)
        } else {
            throw"malformed attrTypeAndValueStr: " + e
        }
    };
    this.setByAttrTypeAndValueStr = function (g, f) {
        this.typeObj = KJUR.asn1.x509.OID.atype2obj(g);
        var e = a;
        if (g == "C") {
            e = "prn"
        }
        this.valueObj = this.getValueObj(e, f)
    };
    this.getValueObj = function (f, e) {
        if (f == "utf8") {
            return new KJUR.asn1.DERUTF8String({str: e})
        }
        if (f == "prn") {
            return new KJUR.asn1.DERPrintableString({str: e})
        }
        if (f == "tel") {
            return new KJUR.asn1.DERTeletexString({str: e})
        }
        if (f == "ia5") {
            return new KJUR.asn1.DERIA5String({str: e})
        }
        throw"unsupported directory string type: type=" + f + " value=" + e
    };
    this.getEncodedHex = function () {
        var e = new KJUR.asn1.DERSequence({array: [this.typeObj, this.valueObj]});
        this.TLV = e.getEncodedHex();
        return this.TLV
    };
    if (typeof b != "undefined") {
        if (typeof b.str != "undefined") {
            this.setByString(b.str)
        }
    }
};
YAHOO.lang.extend(KJUR.asn1.x509.AttributeTypeAndValue, KJUR.asn1.ASN1Object);
KJUR.asn1.x509.SubjectPublicKeyInfo = function (d) {
    KJUR.asn1.x509.SubjectPublicKeyInfo.superclass.constructor.call(this);
    var b = null;
    var c = null;
    var a = null;
    this.setRSAKey = function (e) {
        if (!RSAKey.prototype.isPrototypeOf(e)) {
            throw"argument is not RSAKey instance"
        }
        this.rsaKey = e;
        var g = new KJUR.asn1.DERInteger({bigint: e.n});
        var f = new KJUR.asn1.DERInteger({"int": e.e});
        var i = new KJUR.asn1.DERSequence({array: [g, f]});
        var h = i.getEncodedHex();
        this.asn1AlgId = new KJUR.asn1.x509.AlgorithmIdentifier({name: "rsaEncryption"});
        this.asn1SubjPKey = new KJUR.asn1.DERBitString({hex: "00" + h})
    };
    this.setRSAPEM = function (g) {
        if (g.match(/-----BEGIN PUBLIC KEY-----/)) {
            var n = g;
            n = n.replace(/^-----[^-]+-----/, "");
            n = n.replace(/-----[^-]+-----\s*$/, "");
            var m = n.replace(/\s+/g, "");
            var f = CryptoJS.enc.Base64.parse(m);
            var i = CryptoJS.enc.Hex.stringify(f);
            var k = _rsapem_getHexValueArrayOfChildrenFromHex(i);
            var h = k[1];
            var l = h.substr(2);
            var e = _rsapem_getHexValueArrayOfChildrenFromHex(l);
            var j = new RSAKey();
            j.setPublic(e[0], e[1]);
            this.setRSAKey(j)
        } else {
            throw"key not supported"
        }
    };
    this.getEncodedHex = function () {
        if (this.asn1AlgId == null || this.asn1SubjPKey == null) {
            throw"algId and/or subjPubKey not set"
        }
        var e = new KJUR.asn1.DERSequence({array: [this.asn1AlgId, this.asn1SubjPKey]});
        this.hTLV = e.getEncodedHex();
        return this.hTLV
    };
    if (typeof d != "undefined") {
        if (typeof d.rsakey != "undefined") {
            this.setRSAKey(d.rsakey)
        }
        if (typeof d.rsapem != "undefined") {
            this.setRSAPEM(d.rsapem)
        }
    }
};
YAHOO.lang.extend(KJUR.asn1.x509.SubjectPublicKeyInfo, KJUR.asn1.ASN1Object);
KJUR.asn1.x509.Time = function (c) {
    KJUR.asn1.x509.Time.superclass.constructor.call(this);
    var b = null;
    var a = null;
    this.setTimeParams = function (d) {
        this.timeParams = d
    };
    this.getEncodedHex = function () {
        if (this.timeParams == null) {
            throw"timeParams shall be specified. ({'str':'130403235959Z'}}"
        }
        var d = null;
        if (this.type == "utc") {
            d = new KJUR.asn1.DERUTCTime(this.timeParams)
        } else {
            d = new KJUR.asn1.DERGeneralizedTime(this.timeParams)
        }
        this.TLV = d.getEncodedHex();
        return this.TLV
    };
    this.type = "utc";
    if (typeof c != "undefined") {
        if (typeof c.type != "undefined") {
            this.type = c.type
        }
        this.timeParams = c
    }
};
YAHOO.lang.extend(KJUR.asn1.x509.Time, KJUR.asn1.ASN1Object);
KJUR.asn1.x509.AlgorithmIdentifier = function (d) {
    KJUR.asn1.x509.AlgorithmIdentifier.superclass.constructor.call(this);
    var a = null;
    var c = null;
    var b = null;
    this.getEncodedHex = function () {
        if (this.nameAlg == null && this.asn1Alg == null) {
            throw"algorithm not specified"
        }
        if (this.nameAlg != null && this.asn1Alg == null) {
            this.asn1Alg = KJUR.asn1.x509.OID.name2obj(this.nameAlg)
        }
        var e = new KJUR.asn1.DERSequence({array: [this.asn1Alg, this.asn1Params]});
        this.hTLV = e.getEncodedHex();
        return this.hTLV
    };
    if (typeof d != "undefined") {
        if (typeof d.name != "undefined") {
            this.nameAlg = d.name
        }
        if (typeof d.asn1params != "undefined") {
            this.asn1Params = d.asn1params
        }
    }
    if (this.asn1Params == null) {
        this.asn1Params = new KJUR.asn1.DERNull()
    }
};
YAHOO.lang.extend(KJUR.asn1.x509.AlgorithmIdentifier, KJUR.asn1.ASN1Object);
KJUR.asn1.x509.GeneralName = function (d) {
    KJUR.asn1.x509.GeneralName.superclass.constructor.call(this);
    var c = null;
    var b = null;
    var a = {rfc822: "81", dns: "82", uri: "86"};
    this.setByParam = function (g) {
        var f = null;
        var e = null;
        if (typeof g.rfc822 != "undefined") {
            this.type = "rfc822";
            e = new KJUR.asn1.DERIA5String({str: g[this.type]})
        }
        if (typeof g.dns != "undefined") {
            this.type = "dns";
            e = new KJUR.asn1.DERIA5String({str: g[this.type]})
        }
        if (typeof g.uri != "undefined") {
            this.type = "uri";
            e = new KJUR.asn1.DERIA5String({str: g[this.type]})
        }
        if (this.type == null) {
            throw"unsupported type in params=" + g
        }
        this.asn1Obj = new KJUR.asn1.DERTaggedObject({explicit: false, tag: a[this.type], obj: e})
    };
    this.getEncodedHex = function () {
        return this.asn1Obj.getEncodedHex()
    };
    if (typeof d != "undefined") {
        this.setByParam(d)
    }
};
YAHOO.lang.extend(KJUR.asn1.x509.GeneralName, KJUR.asn1.ASN1Object);
KJUR.asn1.x509.GeneralNames = function (b) {
    KJUR.asn1.x509.GeneralNames.superclass.constructor.call(this);
    var a = null;
    this.setByParamArray = function (e) {
        for (var c = 0; c < e.length; c++) {
            var d = new KJUR.asn1.x509.GeneralName(e[c]);
            this.asn1Array.push(d)
        }
    };
    this.getEncodedHex = function () {
        var c = new KJUR.asn1.DERSequence({array: this.asn1Array});
        return c.getEncodedHex()
    };
    this.asn1Array = new Array();
    if (typeof b != "undefined") {
        this.setByParamArray(b)
    }
};
YAHOO.lang.extend(KJUR.asn1.x509.GeneralNames, KJUR.asn1.ASN1Object);
KJUR.asn1.x509.DistributionPointName = function (b) {
    KJUR.asn1.x509.DistributionPointName.superclass.constructor.call(this);
    var e = null;
    var c = null;
    var a = null;
    var d = null;
    this.getEncodedHex = function () {
        if (this.type != "full") {
            throw"currently type shall be 'full': " + this.type
        }
        this.asn1Obj = new KJUR.asn1.DERTaggedObject({explicit: false, tag: this.tag, obj: this.asn1V});
        this.hTLV = this.asn1Obj.getEncodedHex();
        return this.hTLV
    };
    if (typeof b != "undefined") {
        if (KJUR.asn1.x509.GeneralNames.prototype.isPrototypeOf(b)) {
            this.type = "full";
            this.tag = "a0";
            this.asn1V = b
        } else {
            throw"This class supports GeneralNames only as argument"
        }
    }
};
YAHOO.lang.extend(KJUR.asn1.x509.DistributionPointName, KJUR.asn1.ASN1Object);
KJUR.asn1.x509.DistributionPoint = function (b) {
    KJUR.asn1.x509.DistributionPoint.superclass.constructor.call(this);
    var a = null;
    this.getEncodedHex = function () {
        var c = new KJUR.asn1.DERSequence();
        if (this.asn1DP != null) {
            var d = new KJUR.asn1.DERTaggedObject({explicit: true, tag: "a0", obj: this.asn1DP});
            c.appendASN1Object(d)
        }
        this.hTLV = c.getEncodedHex();
        return this.hTLV
    };
    if (typeof b != "undefined") {
        if (typeof b.dpobj != "undefined") {
            this.asn1DP = b.dpobj
        }
    }
};
YAHOO.lang.extend(KJUR.asn1.x509.DistributionPoint, KJUR.asn1.ASN1Object);
KJUR.asn1.x509.OID = new function (a) {
    this.atype2oidList = {C: "2.5.4.6", O: "2.5.4.10", OU: "2.5.4.11", ST: "2.5.4.8", L: "2.5.4.7", CN: "2.5.4.3",};
    this.name2oidList = {
        sha384: "2.16.840.1.101.3.4.2.2",
        sha224: "2.16.840.1.101.3.4.2.4",
        SHA1withRSA: "1.2.840.113549.1.1.5",
        rsaEncryption: "1.2.840.113549.1.1.1",
        subjectKeyIdentifier: "2.5.29.14",
        keyUsage: "2.5.29.15",
        basicConstraints: "2.5.29.19",
        cRLDistributionPoints: "2.5.29.31",
        certificatePolicies: "2.5.29.32",
        authorityKeyIdentifier: "2.5.29.35",
        extKeyUsage: "2.5.29.37",
        anyExtendedKeyUsage: "2.5.29.37.0",
        serverAuth: "1.3.6.1.5.5.7.3.1",
        clientAuth: "1.3.6.1.5.5.7.3.2",
        codeSigning: "1.3.6.1.5.5.7.3.3",
        emailProtection: "1.3.6.1.5.5.7.3.4",
        timeStamping: "1.3.6.1.5.5.7.3.8",
        ocspSigning: "1.3.6.1.5.5.7.3.9",
    };
    this.objCache = {};
    this.name2obj = function (b) {
        if (typeof this.objCache[b] != "undefined") {
            return this.objCache[b]
        }
        if (typeof this.name2oidList[b] == "undefined") {
            throw"Name of ObjectIdentifier not defined: " + b
        }
        var c = this.name2oidList[b];
        var d = new KJUR.asn1.DERObjectIdentifier({oid: c});
        this.objCache[b] = d;
        return d
    };
    this.atype2obj = function (b) {
        if (typeof this.objCache[b] != "undefined") {
            return this.objCache[b]
        }
        if (typeof this.atype2oidList[b] == "undefined") {
            throw"AttributeType name undefined: " + b
        }
        var c = this.atype2oidList[b];
        var d = new KJUR.asn1.DERObjectIdentifier({oid: c});
        this.objCache[b] = d;
        return d
    }
};
KJUR.asn1.x509.X509Util = new function () {
    this.getPKCS8PubKeyPEMfromRSAKey = function (i) {
        var h = null;
        var f = KJUR.asn1.ASN1Util.bigIntToMinTwosComplementsHex(i.n);
        var j = KJUR.asn1.ASN1Util.integerToByteHex(i.e);
        var a = new KJUR.asn1.DERInteger({hex: f});
        var g = new KJUR.asn1.DERInteger({hex: j});
        var l = new KJUR.asn1.DERSequence({array: [a, g]});
        var c = l.getEncodedHex();
        var d = new KJUR.asn1.x509.AlgorithmIdentifier({name: "rsaEncryption"});
        var b = new KJUR.asn1.DERBitString({hex: "00" + c});
        var k = new KJUR.asn1.DERSequence({array: [d, b]});
        var e = k.getEncodedHex();
        var h = KJUR.asn1.ASN1Util.getPEMStringFromHex(e, "PUBLIC KEY");
        return h
    }
};
/*! base64x-1.1.2 (c) 2013 Kenji Urushima | kjur.github.com/jsjws/license
 */
function Base64x() {
}
function stoBA(d) {
    var b = new Array();
    for (var c = 0; c < d.length; c++) {
        b[c] = d.charCodeAt(c)
    }
    return b
}
function BAtos(b) {
    var d = "";
    for (var c = 0; c < b.length; c++) {
        d = d + String.fromCharCode(b[c])
    }
    return d
}
function BAtohex(b) {
    var e = "";
    for (var d = 0; d < b.length; d++) {
        var c = b[d].toString(16);
        if (c.length == 1) {
            c = "0" + c
        }
        e = e + c
    }
    return e
}
function stohex(a) {
    return BAtohex(stoBA(a))
}
function stob64(a) {
    return hex2b64(stohex(a))
}
function stob64u(a) {
    return b64tob64u(hex2b64(stohex(a)))
}
function b64utos(a) {
    return BAtos(b64toBA(b64utob64(a)))
}
function b64tob64u(a) {
    a = a.replace(/\=/g, "");
    a = a.replace(/\+/g, "-");
    a = a.replace(/\//g, "_");
    return a
}
function b64utob64(a) {
    if (a.length % 4 == 2) {
        a = a + "=="
    } else {
        if (a.length % 4 == 3) {
            a = a + "="
        }
    }
    a = a.replace(/-/g, "+");
    a = a.replace(/_/g, "/");
    return a
}
function hextob64u(a) {
    return b64tob64u(hex2b64(a))
}
function b64utohex(a) {
    return b64tohex(b64utob64(a))
}
var utf8tob64u, b64utoutf8;
if (typeof Buffer === "function") {
    utf8tob64u = function (a) {
        return b64tob64u(new Buffer(a, "utf8").toString("base64"))
    };
    b64utoutf8 = function (a) {
        return new Buffer(b64utob64(a), "base64").toString("utf8")
    }
} else {
    utf8tob64u = function (a) {
        return hextob64u(uricmptohex(encodeURIComponentAll(a)))
    };
    b64utoutf8 = function (a) {
        return decodeURIComponent(hextouricmp(b64utohex(a)))
    }
}
function utf8tob64(a) {
    return hex2b64(uricmptohex(encodeURIComponentAll(a)))
}
function b64toutf8(a) {
    return decodeURIComponent(hextouricmp(b64tohex(a)))
}
function utf8tohex(a) {
    return uricmptohex(encodeURIComponentAll(a))
}
function hextoutf8(a) {
    return decodeURIComponent(hextouricmp(a))
}
function hextorstr(c) {
    var b = "";
    for (var a = 0; a < c.length - 1; a += 2) {
        b += String.fromCharCode(parseInt(c.substr(a, 2), 16))
    }
    return b
}
function rstrtohex(c) {
    var a = "";
    for (var b = 0; b < c.length; b++) {
        a += ("0" + c.charCodeAt(b).toString(16)).slice(-2)
    }
    return a
}
function uricmptohex(a) {
    return a.replace(/%/g, "")
}
function hextouricmp(a) {
    return a.replace(/(..)/g, "%$1")
}
function encodeURIComponentAll(a) {
    var d = encodeURIComponent(a);
    var b = "";
    for (var c = 0; c < d.length; c++) {
        if (d[c] == "%") {
            b = b + d.substr(c, 3);
            c = c + 2
        } else {
            b = b + "%" + stohex(d[c])
        }
    }
    return b
}
function newline_toUnix(a) {
    a = a.replace(/\r\n/mg, "\n");
    return a
}
function newline_toDos(a) {
    a = a.replace(/\r\n/mg, "\n");
    a = a.replace(/\n/mg, "\r\n");
    return a
};/*! crypto-1.1.3.js (c) 2013 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
if (typeof KJUR == "undefined" || !KJUR) {
    KJUR = {}
}
if (typeof KJUR.crypto == "undefined" || !KJUR.crypto) {
    KJUR.crypto = {}
}
KJUR.crypto.Util = new function () {
    this.DIGESTINFOHEAD = {
        sha1: "3021300906052b0e03021a05000414",
        sha224: "302d300d06096086480165030402040500041c",
        sha256: "3031300d060960864801650304020105000420",
        sha384: "3041300d060960864801650304020205000430",
        sha512: "3051300d060960864801650304020305000440",
        md2: "3020300c06082a864886f70d020205000410",
        md5: "3020300c06082a864886f70d020505000410",
        ripemd160: "3021300906052b2403020105000414",
    };
    this.DEFAULTPROVIDER = {
        md5: "cryptojs",
        sha1: "cryptojs",
        sha224: "cryptojs",
        sha256: "cryptojs",
        sha384: "cryptojs",
        sha512: "cryptojs",
        ripemd160: "cryptojs",
        hmacmd5: "cryptojs",
        hmacsha1: "cryptojs",
        hmacsha224: "cryptojs",
        hmacsha256: "cryptojs",
        hmacsha384: "cryptojs",
        hmacsha512: "cryptojs",
        hmacripemd160: "cryptojs",
        MD5withRSA: "cryptojs/jsrsa",
        SHA1withRSA: "cryptojs/jsrsa",
        SHA224withRSA: "cryptojs/jsrsa",
        SHA256withRSA: "cryptojs/jsrsa",
        SHA384withRSA: "cryptojs/jsrsa",
        SHA512withRSA: "cryptojs/jsrsa",
        RIPEMD160withRSA: "cryptojs/jsrsa",
        MD5withECDSA: "cryptojs/jsrsa",
        SHA1withECDSA: "cryptojs/jsrsa",
        SHA224withECDSA: "cryptojs/jsrsa",
        SHA256withECDSA: "cryptojs/jsrsa",
        SHA384withECDSA: "cryptojs/jsrsa",
        SHA512withECDSA: "cryptojs/jsrsa",
        RIPEMD160withECDSA: "cryptojs/jsrsa",
        MD5withRSAandMGF1: "cryptojs/jsrsa",
        SHA1withRSAandMGF1: "cryptojs/jsrsa",
        SHA224withRSAandMGF1: "cryptojs/jsrsa",
        SHA256withRSAandMGF1: "cryptojs/jsrsa",
        SHA384withRSAandMGF1: "cryptojs/jsrsa",
        SHA512withRSAandMGF1: "cryptojs/jsrsa",
        RIPEMD160withRSAandMGF1: "cryptojs/jsrsa",
    };
    this.CRYPTOJSMESSAGEDIGESTNAME = {
        md5: "CryptoJS.algo.MD5",
        sha1: "CryptoJS.algo.SHA1",
        sha224: "CryptoJS.algo.SHA224",
        sha256: "CryptoJS.algo.SHA256",
        sha384: "CryptoJS.algo.SHA384",
        sha512: "CryptoJS.algo.SHA512",
        ripemd160: "CryptoJS.algo.RIPEMD160"
    };
    this.getDigestInfoHex = function (a, b) {
        if (typeof this.DIGESTINFOHEAD[b] == "undefined") {
            throw"alg not supported in Util.DIGESTINFOHEAD: " + b
        }
        return this.DIGESTINFOHEAD[b] + a
    };
    this.getPaddedDigestInfoHex = function (h, a, j) {
        var c = this.getDigestInfoHex(h, a);
        var d = j / 4;
        if (c.length + 22 > d) {
            throw"key is too short for SigAlg: keylen=" + j + "," + a
        }
        var b = "0001";
        var k = "00" + c;
        var g = "";
        var l = d - b.length - k.length;
        for (var f = 0; f < l; f += 2) {
            g += "ff"
        }
        var e = b + g + k;
        return e
    };
    this.hashString = function (a, c) {
        var b = new KJUR.crypto.MessageDigest({alg: c});
        return b.digestString(a)
    };
    this.hashHex = function (b, c) {
        var a = new KJUR.crypto.MessageDigest({alg: c});
        return a.digestHex(b)
    };
    this.sha1 = function (a) {
        var b = new KJUR.crypto.MessageDigest({alg: "sha1", prov: "cryptojs"});
        return b.digestString(a)
    };
    this.sha256 = function (a) {
        var b = new KJUR.crypto.MessageDigest({alg: "sha256", prov: "cryptojs"});
        return b.digestString(a)
    };
    this.sha256Hex = function (a) {
        var b = new KJUR.crypto.MessageDigest({alg: "sha256", prov: "cryptojs"});
        return b.digestHex(a)
    };
    this.sha512 = function (a) {
        var b = new KJUR.crypto.MessageDigest({alg: "sha512", prov: "cryptojs"});
        return b.digestString(a)
    };
    this.sha512Hex = function (a) {
        var b = new KJUR.crypto.MessageDigest({alg: "sha512", prov: "cryptojs"});
        return b.digestHex(a)
    };
    this.md5 = function (a) {
        var b = new KJUR.crypto.MessageDigest({alg: "md5", prov: "cryptojs"});
        return b.digestString(a)
    };
    this.ripemd160 = function (a) {
        var b = new KJUR.crypto.MessageDigest({alg: "ripemd160", prov: "cryptojs"});
        return b.digestString(a)
    };
    this.getCryptoJSMDByName = function (a) {
    }
};
KJUR.crypto.MessageDigest = function (params) {
    var md = null;
    var algName = null;
    var provName = null;
    this.setAlgAndProvider = function (alg, prov) {
        if (alg != null && prov === undefined) {
            prov = KJUR.crypto.Util.DEFAULTPROVIDER[alg]
        }
        if (":md5:sha1:sha224:sha256:sha384:sha512:ripemd160:".indexOf(alg) != -1 && prov == "cryptojs") {
            try {
                this.md = eval(KJUR.crypto.Util.CRYPTOJSMESSAGEDIGESTNAME[alg]).create()
            } catch (ex) {
                throw"setAlgAndProvider hash alg set fail alg=" + alg + "/" + ex
            }
            this.updateString = function (str) {
                this.md.update(str)
            };
            this.updateHex = function (hex) {
                var wHex = CryptoJS.enc.Hex.parse(hex);
                this.md.update(wHex)
            };
            this.digest = function () {
                var hash = this.md.finalize();
                return hash.toString(CryptoJS.enc.Hex)
            };
            this.digestString = function (str) {
                this.updateString(str);
                return this.digest()
            };
            this.digestHex = function (hex) {
                this.updateHex(hex);
                return this.digest()
            }
        }
        if (":sha256:".indexOf(alg) != -1 && prov == "sjcl") {
            try {
                this.md = new sjcl.hash.sha256()
            } catch (ex) {
                throw"setAlgAndProvider hash alg set fail alg=" + alg + "/" + ex
            }
            this.updateString = function (str) {
                this.md.update(str)
            };
            this.updateHex = function (hex) {
                var baHex = sjcl.codec.hex.toBits(hex);
                this.md.update(baHex)
            };
            this.digest = function () {
                var hash = this.md.finalize();
                return sjcl.codec.hex.fromBits(hash)
            };
            this.digestString = function (str) {
                this.updateString(str);
                return this.digest()
            };
            this.digestHex = function (hex) {
                this.updateHex(hex);
                return this.digest()
            }
        }
    };
    this.updateString = function (str) {
        throw"updateString(str) not supported for this alg/prov: " + this.algName + "/" + this.provName
    };
    this.updateHex = function (hex) {
        throw"updateHex(hex) not supported for this alg/prov: " + this.algName + "/" + this.provName
    };
    this.digest = function () {
        throw"digest() not supported for this alg/prov: " + this.algName + "/" + this.provName
    };
    this.digestString = function (str) {
        throw"digestString(str) not supported for this alg/prov: " + this.algName + "/" + this.provName
    };
    this.digestHex = function (hex) {
        throw"digestHex(hex) not supported for this alg/prov: " + this.algName + "/" + this.provName
    };
    if (params !== undefined) {
        if (params.alg !== undefined) {
            this.algName = params.alg;
            if (params.prov === undefined) {
                this.provName = KJUR.crypto.Util.DEFAULTPROVIDER[this.algName]
            }
            this.setAlgAndProvider(this.algName, this.provName)
        }
    }
};
KJUR.crypto.Mac = function (params) {
    var mac = null;
    var pass = null;
    var algName = null;
    var provName = null;
    var algProv = null;
    this.setAlgAndProvider = function (alg, prov) {
        if (alg == null) {
            alg = "hmacsha1"
        }
        alg = alg.toLowerCase();
        if (alg.substr(0, 4) != "hmac") {
            throw"setAlgAndProvider unsupported HMAC alg: " + alg
        }
        if (prov === undefined) {
            prov = KJUR.crypto.Util.DEFAULTPROVIDER[alg]
        }
        this.algProv = alg + "/" + prov;
        var hashAlg = alg.substr(4);
        if (":md5:sha1:sha224:sha256:sha384:sha512:ripemd160:".indexOf(hashAlg) != -1 && prov == "cryptojs") {
            try {
                var mdObj = eval(KJUR.crypto.Util.CRYPTOJSMESSAGEDIGESTNAME[hashAlg]);
                this.mac = CryptoJS.algo.HMAC.create(mdObj, this.pass)
            } catch (ex) {
                throw"setAlgAndProvider hash alg set fail hashAlg=" + hashAlg + "/" + ex
            }
            this.updateString = function (str) {
                this.mac.update(str)
            };
            this.updateHex = function (hex) {
                var wHex = CryptoJS.enc.Hex.parse(hex);
                this.mac.update(wHex)
            };
            this.doFinal = function () {
                var hash = this.mac.finalize();
                return hash.toString(CryptoJS.enc.Hex)
            };
            this.doFinalString = function (str) {
                this.updateString(str);
                return this.doFinal()
            };
            this.doFinalHex = function (hex) {
                this.updateHex(hex);
                return this.doFinal()
            }
        }
    };
    this.updateString = function (str) {
        throw"updateString(str) not supported for this alg/prov: " + this.algProv
    };
    this.updateHex = function (hex) {
        throw"updateHex(hex) not supported for this alg/prov: " + this.algProv
    };
    this.doFinal = function () {
        throw"digest() not supported for this alg/prov: " + this.algProv
    };
    this.doFinalString = function (str) {
        throw"digestString(str) not supported for this alg/prov: " + this.algProv
    };
    this.doFinalHex = function (hex) {
        throw"digestHex(hex) not supported for this alg/prov: " + this.algProv
    };
    if (params !== undefined) {
        if (params.pass !== undefined) {
            this.pass = params.pass
        }
        if (params.alg !== undefined) {
            this.algName = params.alg;
            if (params.prov === undefined) {
                this.provName = KJUR.crypto.Util.DEFAULTPROVIDER[this.algName]
            }
            this.setAlgAndProvider(this.algName, this.provName)
        }
    }
};
KJUR.crypto.Signature = function (o) {
    var q = null;
    var n = null;
    var r = null;
    var c = null;
    var l = null;
    var d = null;
    var k = null;
    var h = null;
    var p = null;
    var e = null;
    var b = -1;
    var g = null;
    var j = null;
    var a = null;
    var i = null;
    var f = null;
    this._setAlgNames = function () {
        if (this.algName.match(/^(.+)with(.+)$/)) {
            this.mdAlgName = RegExp.$1.toLowerCase();
            this.pubkeyAlgName = RegExp.$2.toLowerCase()
        }
    };
    this._zeroPaddingOfSignature = function (x, w) {
        var v = "";
        var t = w / 4 - x.length;
        for (var u = 0; u < t; u++) {
            v = v + "0"
        }
        return v + x
    };
    this.setAlgAndProvider = function (u, t) {
        this._setAlgNames();
        if (t != "cryptojs/jsrsa") {
            throw"provider not supported: " + t
        }
        if (":md5:sha1:sha224:sha256:sha384:sha512:ripemd160:".indexOf(this.mdAlgName) != -1) {
            try {
                this.md = new KJUR.crypto.MessageDigest({alg: this.mdAlgName})
            } catch (s) {
                throw"setAlgAndProvider hash alg set fail alg=" + this.mdAlgName + "/" + s
            }
            this.init = function (v, w) {
                if (typeof v == "string") {
                    if (v.indexOf("-END ENCRYPTED PRIVATE KEY-", 0) != -1 && w !== undefined) {
                        this.prvKey = PKCS5PKEY.getKeyFromEncryptedPKCS8PEM(v, w);
                        this.state = "SIGN"
                    } else {
                        if (v.indexOf("-END RSA PRIVATE KEY-", 0) != -1 && v.indexOf(",ENCRYPTED", 0) != -1 && w !== undefined) {
                            this.prvKey = PKCS5PKEY.getRSAKeyFromEncryptedPKCS5PEM(v, w);
                            this.state = "SIGN"
                        } else {
                            if (v.indexOf("-END RSA PRIVATE KEY-", 0) != -1 && v.indexOf(",ENCRYPTED", 0) == -1 && w === undefined) {
                                this.prvKey = new RSAKey();
                                this.prvKey.readPrivateKeyFromPEMString(v);
                                this.state = "SIGN"
                            } else {
                                if (v.indexOf("-END PRIVATE KEY-", 0) != -1 && w === undefined) {
                                    this.prvKey = PKCS5PKEY.getKeyFromPlainPrivatePKCS8PEM(v);
                                    this.state = "SIGN"
                                } else {
                                    if (v.indexOf("-END PUBLIC KEY-", 0) != -1 && w === undefined) {
                                        this.pubKey = PKCS5PKEY.getKeyFromPublicPKCS8PEM(v);
                                        this.state = "VERIFY"
                                    } else {
                                        if ((v.indexOf("-END CERTIFICATE-", 0) != -1 || v.indexOf("-END X509 CERTIFICATE-", 0) != -1 || v.indexOf("-END TRUSTED CERTIFICATE-", 0) != -1) && w === undefined) {
                                            this.pubKey = X509.getPublicKeyFromCertPEM(v);
                                            this.state = "VERIFY"
                                        } else {
                                            throw"unsupported arguments"
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else {
                    if (v instanceof RSAKey) {
                        if (v.d != null) {
                            this.prvKey = v;
                            this.state = "SIGN"
                        } else {
                            if (v.n != null) {
                                this.pubKey = v;
                                this.state = "VERIFY"
                            } else {
                                throw"RSAKey object is not private and public key"
                            }
                        }
                    } else {
                        if (v instanceof KJUR.crypto.ECDSA) {
                            if (v.prvKeyHex != null) {
                                this.prvKey = v;
                                this.state = "SIGN"
                            } else {
                                if (v.pubKeyHex != null) {
                                    this.pubKey = v;
                                    this.state = "VERIFY"
                                } else {
                                    throw"ECDSA object is not private and public key"
                                }
                            }
                        }
                    }
                }
            };
            this.initSign = function (v) {
                if (typeof v.ecprvhex == "string" && typeof v.eccurvename == "string") {
                    this.ecprvhex = v.ecprvhex;
                    this.eccurvename = v.eccurvename
                } else {
                    this.prvKey = v
                }
                this.state = "SIGN"
            };
            this.initVerifyByPublicKey = function (v) {
                if (typeof v.ecpubhex == "string" && typeof v.eccurvename == "string") {
                    this.ecpubhex = v.ecpubhex;
                    this.eccurvename = v.eccurvename
                } else {
                    if (v instanceof KJUR.crypto.ECDSA) {
                        this.pubKey = v
                    } else {
                        if (v instanceof RSAKey) {
                            this.pubKey = v
                        }
                    }
                }
                this.state = "VERIFY"
            };
            this.initVerifyByCertificatePEM = function (v) {
                var w = new X509();
                w.readCertPEM(v);
                this.pubKey = w.subjectPublicKeyRSA;
                this.state = "VERIFY"
            };
            this.updateString = function (v) {
                this.md.updateString(v)
            };
            this.updateHex = function (v) {
                this.md.updateHex(v)
            };
            this.sign = function () {
                this.sHashHex = this.md.digest();
                if (typeof this.ecprvhex != "undefined" && typeof this.eccurvename != "undefined") {
                    var v = new KJUR.crypto.ECDSA({curve: this.eccurvename});
                    this.hSign = v.signHex(this.sHashHex, this.ecprvhex)
                } else {
                    if (this.pubkeyAlgName == "rsaandmgf1") {
                        this.hSign = this.prvKey.signWithMessageHashPSS(this.sHashHex, this.mdAlgName, this.pssSaltLen)
                    } else {
                        if (this.pubkeyAlgName == "rsa") {
                            this.hSign = this.prvKey.signWithMessageHash(this.sHashHex, this.mdAlgName)
                        } else {
                            if (this.prvKey instanceof KJUR.crypto.ECDSA) {
                                this.hSign = this.prvKey.signWithMessageHash(this.sHashHex)
                            } else {
                                throw"Signature: unsupported public key alg: " + this.pubkeyAlgName
                            }
                        }
                    }
                }
                return this.hSign
            };
            this.signString = function (v) {
                this.updateString(v);
                this.sign()
            };
            this.signHex = function (v) {
                this.updateHex(v);
                this.sign()
            };
            this.verify = function (v) {
                this.sHashHex = this.md.digest();
                if (typeof this.ecpubhex != "undefined" && typeof this.eccurvename != "undefined") {
                    var w = new KJUR.crypto.ECDSA({curve: this.eccurvename});
                    return w.verifyHex(this.sHashHex, v, this.ecpubhex)
                } else {
                    if (this.pubkeyAlgName == "rsaandmgf1") {
                        return this.pubKey.verifyWithMessageHashPSS(this.sHashHex, v, this.mdAlgName, this.pssSaltLen)
                    } else {
                        if (this.pubkeyAlgName == "rsa") {
                            return this.pubKey.verifyWithMessageHash(this.sHashHex, v)
                        } else {
                            if (this.pubKey instanceof KJUR.crypto.ECDSA) {
                                return this.pubKey.verifyWithMessageHash(this.sHashHex, v)
                            } else {
                                throw"Signature: unsupported public key alg: " + this.pubkeyAlgName
                            }
                        }
                    }
                }
            }
        }
    };
    this.init = function (s, t) {
        throw"init(key, pass) not supported for this alg:prov=" + this.algProvName
    };
    this.initVerifyByPublicKey = function (s) {
        throw"initVerifyByPublicKey(rsaPubKeyy) not supported for this alg:prov=" + this.algProvName
    };
    this.initVerifyByCertificatePEM = function (s) {
        throw"initVerifyByCertificatePEM(certPEM) not supported for this alg:prov=" + this.algProvName
    };
    this.initSign = function (s) {
        throw"initSign(prvKey) not supported for this alg:prov=" + this.algProvName
    };
    this.updateString = function (s) {
        throw"updateString(str) not supported for this alg:prov=" + this.algProvName
    };
    this.updateHex = function (s) {
        throw"updateHex(hex) not supported for this alg:prov=" + this.algProvName
    };
    this.sign = function () {
        throw"sign() not supported for this alg:prov=" + this.algProvName
    };
    this.signString = function (s) {
        throw"digestString(str) not supported for this alg:prov=" + this.algProvName
    };
    this.signHex = function (s) {
        throw"digestHex(hex) not supported for this alg:prov=" + this.algProvName
    };
    this.verify = function (s) {
        throw"verify(hSigVal) not supported for this alg:prov=" + this.algProvName
    };
    this.initParams = o;
    if (o !== undefined) {
        if (o.alg !== undefined) {
            this.algName = o.alg;
            if (o.prov === undefined) {
                this.provName = KJUR.crypto.Util.DEFAULTPROVIDER[this.algName]
            } else {
                this.provName = o.prov
            }
            this.algProvName = this.algName + ":" + this.provName;
            this.setAlgAndProvider(this.algName, this.provName);
            this._setAlgNames()
        }
        if (o.psssaltlen !== undefined) {
            this.pssSaltLen = o.psssaltlen
        }
        if (o.prvkeypem !== undefined) {
            if (o.prvkeypas !== undefined) {
                throw"both prvkeypem and prvkeypas parameters not supported"
            } else {
                try {
                    var q = new RSAKey();
                    q.readPrivateKeyFromPEMString(o.prvkeypem);
                    this.initSign(q)
                } catch (m) {
                    throw"fatal error to load pem private key: " + m
                }
            }
        }
    }
};
KJUR.crypto.OID = new function () {
    this.oidhex2name = {
        "2a864886f70d010101": "rsaEncryption",
        "2a8648ce3d0201": "ecPublicKey",
        "2a8648ce3d030107": "secp256r1",
        "2b8104001f": "secp192k1",
        "2b81040021": "secp224r1",
        "2b8104000a": "secp256k1",
        "2b81040023": "secp521r1",
        "2b81040022": "secp384r1",
    }
};
/*! ecdsa-modified-1.0.3.js (c) Stephan Thomas, Kenji Urushima | github.com/bitcoinjs/bitcoinjs-lib/blob/master/LICENSE
 */
if (typeof KJUR == "undefined" || !KJUR) {
    KJUR = {}
}
if (typeof KJUR.crypto == "undefined" || !KJUR.crypto) {
    KJUR.crypto = {}
}
KJUR.crypto.ECDSA = function (h) {
    var e = "secp256r1";
    var g = null;
    var b = null;
    var f = null;
    var a = new SecureRandom();
    var d = null;
    this.type = "EC";
    function c(s, o, r, n) {
        var j = Math.max(o.bitLength(), n.bitLength());
        var t = s.add2D(r);
        var q = s.curve.getInfinity();
        for (var p = j - 1; p >= 0; --p) {
            q = q.twice2D();
            q.z = BigInteger.ONE;
            if (o.testBit(p)) {
                if (n.testBit(p)) {
                    q = q.add2D(t)
                } else {
                    q = q.add2D(s)
                }
            } else {
                if (n.testBit(p)) {
                    q = q.add2D(r)
                }
            }
        }
        return q
    }

    this.getBigRandom = function (i) {
        return new BigInteger(i.bitLength(), a).mod(i.subtract(BigInteger.ONE)).add(BigInteger.ONE)
    };
    this.setNamedCurve = function (i) {
        this.ecparams = KJUR.crypto.ECParameterDB.getByName(i);
        this.prvKeyHex = null;
        this.pubKeyHex = null;
        this.curveName = i
    };
    this.setPrivateKeyHex = function (i) {
        this.prvKeyHex = i
    };
    this.setPublicKeyHex = function (i) {
        this.pubKeyHex = i
    };
    this.generateKeyPairHex = function () {
        var k = this.ecparams.n;
        var n = this.getBigRandom(k);
        var l = this.ecparams.G.multiply(n);
        var q = l.getX().toBigInteger();
        var o = l.getY().toBigInteger();
        var i = this.ecparams.keylen / 4;
        var m = ("0000000000" + n.toString(16)).slice(-i);
        var r = ("0000000000" + q.toString(16)).slice(-i);
        var p = ("0000000000" + o.toString(16)).slice(-i);
        var j = "04" + r + p;
        this.prvKeyHex = m;
        this.pubKeyHex = j;
        return {ecprvhex: m, ecpubhex: j}
    };
    this.signWithMessageHash = function (i) {
        return this.signHex(i, this.prvKeyHex)
    };
    this.signHex = function (o, j) {
        var t = new BigInteger(j, 16);
        var l = this.ecparams.n;
        var q = new BigInteger(o, 16);
        do {
            var m = this.getBigRandom(l);
            var u = this.ecparams.G;
            var p = u.multiply(m);
            var i = p.getX().toBigInteger().mod(l)
        } while (i.compareTo(BigInteger.ZERO) <= 0);
        var v = m.modInverse(l).multiply(q.add(t.multiply(i))).mod(l);
        return KJUR.crypto.ECDSA.biRSSigToASN1Sig(i, v)
    };
    this.sign = function (m, u) {
        var q = u;
        var j = this.ecparams.n;
        var p = BigInteger.fromByteArrayUnsigned(m);
        do {
            var l = this.getBigRandom(j);
            var t = this.ecparams.G;
            var o = t.multiply(l);
            var i = o.getX().toBigInteger().mod(j)
        } while (i.compareTo(BigInteger.ZERO) <= 0);
        var v = l.modInverse(j).multiply(p.add(q.multiply(i))).mod(j);
        return this.serializeSig(i, v)
    };
    this.verifyWithMessageHash = function (j, i) {
        return this.verifyHex(j, i, this.pubKeyHex)
    };
    this.verifyHex = function (m, i, p) {
        var l, j;
        var o = KJUR.crypto.ECDSA.parseSigHex(i);
        l = o.r;
        j = o.s;
        var k;
        k = ECPointFp.decodeFromHex(this.ecparams.curve, p);
        var n = new BigInteger(m, 16);
        return this.verifyRaw(n, l, j, k)
    };
    this.verify = function (o, p, j) {
        var l, i;
        if (Bitcoin.Util.isArray(p)) {
            var n = this.parseSig(p);
            l = n.r;
            i = n.s
        } else {
            if ("object" === typeof p && p.r && p.s) {
                l = p.r;
                i = p.s
            } else {
                throw"Invalid value for signature"
            }
        }
        var k;
        if (j instanceof ECPointFp) {
            k = j
        } else {
            if (Bitcoin.Util.isArray(j)) {
                k = ECPointFp.decodeFrom(this.ecparams.curve, j)
            } else {
                throw"Invalid format for pubkey value, must be byte array or ECPointFp"
            }
        }
        var m = BigInteger.fromByteArrayUnsigned(o);
        return this.verifyRaw(m, l, i, k)
    };
    this.verifyRaw = function (o, i, w, m) {
        var l = this.ecparams.n;
        var u = this.ecparams.G;
        if (i.compareTo(BigInteger.ONE) < 0 || i.compareTo(l) >= 0) {
            return false
        }
        if (w.compareTo(BigInteger.ONE) < 0 || w.compareTo(l) >= 0) {
            return false
        }
        var p = w.modInverse(l);
        var k = o.multiply(p).mod(l);
        var j = i.multiply(p).mod(l);
        var q = u.multiply(k).add(m.multiply(j));
        var t = q.getX().toBigInteger().mod(l);
        return t.equals(i)
    };
    this.serializeSig = function (k, j) {
        var l = k.toByteArraySigned();
        var i = j.toByteArraySigned();
        var m = [];
        m.push(2);
        m.push(l.length);
        m = m.concat(l);
        m.push(2);
        m.push(i.length);
        m = m.concat(i);
        m.unshift(m.length);
        m.unshift(48);
        return m
    };
    this.parseSig = function (n) {
        var m;
        if (n[0] != 48) {
            throw new Error("Signature not a valid DERSequence")
        }
        m = 2;
        if (n[m] != 2) {
            throw new Error("First element in signature must be a DERInteger")
        }
        var l = n.slice(m + 2, m + 2 + n[m + 1]);
        m += 2 + n[m + 1];
        if (n[m] != 2) {
            throw new Error("Second element in signature must be a DERInteger")
        }
        var i = n.slice(m + 2, m + 2 + n[m + 1]);
        m += 2 + n[m + 1];
        var k = BigInteger.fromByteArrayUnsigned(l);
        var j = BigInteger.fromByteArrayUnsigned(i);
        return {r: k, s: j}
    };
    this.parseSigCompact = function (m) {
        if (m.length !== 65) {
            throw"Signature has the wrong length"
        }
        var j = m[0] - 27;
        if (j < 0 || j > 7) {
            throw"Invalid signature type"
        }
        var o = this.ecparams.n;
        var l = BigInteger.fromByteArrayUnsigned(m.slice(1, 33)).mod(o);
        var k = BigInteger.fromByteArrayUnsigned(m.slice(33, 65)).mod(o);
        return {r: l, s: k, i: j}
    };
    if (h !== undefined) {
        if (h.curve !== undefined) {
            this.curveName = h.curve
        }
    }
    if (this.curveName === undefined) {
        this.curveName = e
    }
    this.setNamedCurve(this.curveName);
    if (h !== undefined) {
        if (h.prv !== undefined) {
            this.prvKeyHex = h.prv
        }
        if (h.pub !== undefined) {
            this.pubKeyHex = h.pub
        }
    }
};
KJUR.crypto.ECDSA.parseSigHex = function (a) {
    var b = KJUR.crypto.ECDSA.parseSigHexInHexRS(a);
    var d = new BigInteger(b.r, 16);
    var c = new BigInteger(b.s, 16);
    return {r: d, s: c}
};
KJUR.crypto.ECDSA.parseSigHexInHexRS = function (c) {
    if (c.substr(0, 2) != "30") {
        throw"signature is not a ASN.1 sequence"
    }
    var b = ASN1HEX.getPosArrayOfChildren_AtObj(c, 0);
    if (b.length != 2) {
        throw"number of signature ASN.1 sequence elements seem wrong"
    }
    var g = b[0];
    var f = b[1];
    if (c.substr(g, 2) != "02") {
        throw"1st item of sequene of signature is not ASN.1 integer"
    }
    if (c.substr(f, 2) != "02") {
        throw"2nd item of sequene of signature is not ASN.1 integer"
    }
    var e = ASN1HEX.getHexOfV_AtObj(c, g);
    var d = ASN1HEX.getHexOfV_AtObj(c, f);
    return {r: e, s: d}
};
KJUR.crypto.ECDSA.asn1SigToConcatSig = function (c) {
    var d = KJUR.crypto.ECDSA.parseSigHexInHexRS(c);
    var b = d.r;
    var a = d.s;
    if (b.substr(0, 2) == "00" && (((b.length / 2) * 8) % (16 * 8)) == 8) {
        b = b.substr(2)
    }
    if (a.substr(0, 2) == "00" && (((a.length / 2) * 8) % (16 * 8)) == 8) {
        a = a.substr(2)
    }
    if ((((b.length / 2) * 8) % (16 * 8)) != 0) {
        throw"unknown ECDSA sig r length error"
    }
    if ((((a.length / 2) * 8) % (16 * 8)) != 0) {
        throw"unknown ECDSA sig s length error"
    }
    return b + a
};
KJUR.crypto.ECDSA.concatSigToASN1Sig = function (a) {
    if ((((a.length / 2) * 8) % (16 * 8)) != 0) {
        throw"unknown ECDSA concatinated r-s sig  length error"
    }
    var c = a.substr(0, a.length / 2);
    var b = a.substr(a.length / 2);
    return KJUR.crypto.ECDSA.hexRSSigToASN1Sig(c, b)
};
KJUR.crypto.ECDSA.hexRSSigToASN1Sig = function (b, a) {
    var d = new BigInteger(b, 16);
    var c = new BigInteger(a, 16);
    return KJUR.crypto.ECDSA.biRSSigToASN1Sig(d, c)
};
KJUR.crypto.ECDSA.biRSSigToASN1Sig = function (e, c) {
    var b = new KJUR.asn1.DERInteger({bigint: e});
    var a = new KJUR.asn1.DERInteger({bigint: c});
    var d = new KJUR.asn1.DERSequence({array: [b, a]});
    return d.getEncodedHex()
};
/*! ecparam-1.0.0.js (c) 2013 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
if (typeof KJUR == "undefined" || !KJUR) {
    KJUR = {}
}
if (typeof KJUR.crypto == "undefined" || !KJUR.crypto) {
    KJUR.crypto = {}
}
KJUR.crypto.ECParameterDB = new function () {
    var b = {};
    var c = {};

    function a(d) {
        return new BigInteger(d, 16)
    }

    this.getByName = function (e) {
        var d = e;
        if (typeof c[d] != "undefined") {
            d = c[e]
        }
        if (typeof b[d] != "undefined") {
            return b[d]
        }
        throw"unregistered EC curve name: " + d
    };
    this.regist = function (A, l, o, g, m, e, j, f, k, u, d, x) {
        b[A] = {};
        var s = a(o);
        var z = a(g);
        var y = a(m);
        var t = a(e);
        var w = a(j);
        var r = new ECCurveFp(s, z, y);
        var q = r.decodePointHex("04" + f + k);
        b[A]["name"] = A;
        b[A]["keylen"] = l;
        b[A]["curve"] = r;
        b[A]["G"] = q;
        b[A]["n"] = t;
        b[A]["h"] = w;
        b[A]["oid"] = d;
        b[A]["info"] = x;
        for (var v = 0; v < u.length; v++) {
            c[u[v]] = A
        }
    }
};
KJUR.crypto.ECParameterDB.regist("secp128r1", 128, "FFFFFFFDFFFFFFFFFFFFFFFFFFFFFFFF", "FFFFFFFDFFFFFFFFFFFFFFFFFFFFFFFC", "E87579C11079F43DD824993C2CEE5ED3", "FFFFFFFE0000000075A30D1B9038A115", "1", "161FF7528B899B2D0C28607CA52C5B86", "CF5AC8395BAFEB13C02DA292DDED7A83", [], "", "secp128r1 : SECG curve over a 128 bit prime field");
KJUR.crypto.ECParameterDB.regist("secp160k1", 160, "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFAC73", "0", "7", "0100000000000000000001B8FA16DFAB9ACA16B6B3", "1", "3B4C382CE37AA192A4019E763036F4F5DD4D7EBB", "938CF935318FDCED6BC28286531733C3F03C4FEE", [], "", "secp160k1 : SECG curve over a 160 bit prime field");
KJUR.crypto.ECParameterDB.regist("secp160r1", 160, "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF7FFFFFFF", "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF7FFFFFFC", "1C97BEFC54BD7A8B65ACF89F81D4D4ADC565FA45", "0100000000000000000001F4C8F927AED3CA752257", "1", "4A96B5688EF573284664698968C38BB913CBFC82", "23A628553168947D59DCC912042351377AC5FB32", [], "", "secp160r1 : SECG curve over a 160 bit prime field");
KJUR.crypto.ECParameterDB.regist("secp192k1", 192, "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFEE37", "0", "3", "FFFFFFFFFFFFFFFFFFFFFFFE26F2FC170F69466A74DEFD8D", "1", "DB4FF10EC057E9AE26B07D0280B7F4341DA5D1B1EAE06C7D", "9B2F2F6D9C5628A7844163D015BE86344082AA88D95E2F9D", []);
KJUR.crypto.ECParameterDB.regist("secp192r1", 192, "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFF", "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFC", "64210519E59C80E70FA7E9AB72243049FEB8DEECC146B9B1", "FFFFFFFFFFFFFFFFFFFFFFFF99DEF836146BC9B1B4D22831", "1", "188DA80EB03090F67CBF20EB43A18800F4FF0AFD82FF1012", "07192B95FFC8DA78631011ED6B24CDD573F977A11E794811", []);
KJUR.crypto.ECParameterDB.regist("secp224r1", 224, "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF000000000000000000000001", "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFE", "B4050A850C04B3ABF54132565044B0B7D7BFD8BA270B39432355FFB4", "FFFFFFFFFFFFFFFFFFFFFFFFFFFF16A2E0B8F03E13DD29455C5C2A3D", "1", "B70E0CBD6BB4BF7F321390B94A03C1D356C21122343280D6115C1D21", "BD376388B5F723FB4C22DFE6CD4375A05A07476444D5819985007E34", []);
KJUR.crypto.ECParameterDB.regist("secp256k1", 256, "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F", "0", "7", "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141", "1", "79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798", "483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8", []);
KJUR.crypto.ECParameterDB.regist("secp256r1", 256, "FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFF", "FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFC", "5AC635D8AA3A93E7B3EBBD55769886BC651D06B0CC53B0F63BCE3C3E27D2604B", "FFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551", "1", "6B17D1F2E12C4247F8BCE6E563A440F277037D812DEB33A0F4A13945D898C296", "4FE342E2FE1A7F9B8EE7EB4A7C0F9E162BCE33576B315ECECBB6406837BF51F5", ["NIST P-256", "P-256", "prime256v1"]);
KJUR.crypto.ECParameterDB.regist("secp384r1", 384, "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFF0000000000000000FFFFFFFF", "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFF0000000000000000FFFFFFFC", "B3312FA7E23EE7E4988E056BE3F82D19181D9C6EFE8141120314088F5013875AC656398D8A2ED19D2A85C8EDD3EC2AEF", "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFC7634D81F4372DDF581A0DB248B0A77AECEC196ACCC52973", "1", "AA87CA22BE8B05378EB1C71EF320AD746E1D3B628BA79B9859F741E082542A385502F25DBF55296C3A545E3872760AB7", "3617de4a96262c6f5d9e98bf9292dc29f8f41dbd289a147ce9da3113b5f0b8c00a60b1ce1d7e819d7a431d7c90ea0e5f", ["NIST P-384", "P-384"]);
KJUR.crypto.ECParameterDB.regist("secp521r1", 521, "1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF", "1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFC", "051953EB9618E1C9A1F929A21A0B68540EEA2DA725B99B315F3B8B489918EF109E156193951EC7E937B1652C0BD3BB1BF073573DF883D2C34F1EF451FD46B503F00", "1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFA51868783BF2F966B7FCC0148F709A5D03BB5C9B8899C47AEBB6FB71E91386409", "1", "C6858E06B70404E9CD9E3ECB662395B4429C648139053FB521F828AF606B4D3DBAA14B5E77EFE75928FE1DC127A2FFA8DE3348B3C1856A429BF97E7E31C2E5BD66", "011839296a789a3bc0045c8a5fb42c7d1bd998f54449579b446817afbd17273e662c97ee72995ef42640c550b9013fad0761353c7086a272c24088be94769fd16650", ["NIST P-521", "P-521"]);
/*! pkcs5pkey-1.0.5.js (c) 2013 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
var PKCS5PKEY = function () {
    var c = function (n, p, o) {
        return i(CryptoJS.AES, n, p, o)
    };
    var d = function (n, p, o) {
        return i(CryptoJS.TripleDES, n, p, o)
    };
    var i = function (q, v, s, o) {
        var p = CryptoJS.enc.Hex.parse(v);
        var u = CryptoJS.enc.Hex.parse(s);
        var n = CryptoJS.enc.Hex.parse(o);
        var r = {};
        r.key = u;
        r.iv = n;
        r.ciphertext = p;
        var t = q.decrypt(r, u, {iv: n});
        return CryptoJS.enc.Hex.stringify(t)
    };
    var j = function (n, p, o) {
        return e(CryptoJS.AES, n, p, o)
    };
    var m = function (n, p, o) {
        return e(CryptoJS.TripleDES, n, p, o)
    };
    var e = function (s, x, v, p) {
        var r = CryptoJS.enc.Hex.parse(x);
        var w = CryptoJS.enc.Hex.parse(v);
        var o = CryptoJS.enc.Hex.parse(p);
        var n = {};
        var u = s.encrypt(r, w, {iv: o});
        var q = CryptoJS.enc.Hex.parse(u.toString());
        var t = CryptoJS.enc.Base64.stringify(q);
        return t
    };
    var g = {
        "AES-256-CBC": {proc: c, eproc: j, keylen: 32, ivlen: 16},
        "AES-192-CBC": {proc: c, eproc: j, keylen: 24, ivlen: 16},
        "AES-128-CBC": {proc: c, eproc: j, keylen: 16, ivlen: 16},
        "DES-EDE3-CBC": {proc: d, eproc: m, keylen: 24, ivlen: 8}
    };
    var b = function (n) {
        return g[n]["proc"]
    };
    var k = function (n) {
        var p = CryptoJS.lib.WordArray.random(n);
        var o = CryptoJS.enc.Hex.stringify(p);
        return o
    };
    var l = function (q) {
        var r = {};
        if (q.match(new RegExp("DEK-Info: ([^,]+),([0-9A-Fa-f]+)", "m"))) {
            r.cipher = RegExp.$1;
            r.ivsalt = RegExp.$2
        }
        if (q.match(new RegExp("-----BEGIN ([A-Z]+) PRIVATE KEY-----"))) {
            r.type = RegExp.$1
        }
        var p = -1;
        var t = 0;
        if (q.indexOf("\r\n\r\n") != -1) {
            p = q.indexOf("\r\n\r\n");
            t = 2
        }
        if (q.indexOf("\n\n") != -1) {
            p = q.indexOf("\n\n");
            t = 1
        }
        var o = q.indexOf("-----END");
        if (p != -1 && o != -1) {
            var n = q.substring(p + t * 2, o - t);
            n = n.replace(/\s+/g, "");
            r.data = n
        }
        return r
    };
    var h = function (o, w, n) {
        var t = n.substring(0, 16);
        var r = CryptoJS.enc.Hex.parse(t);
        var p = CryptoJS.enc.Utf8.parse(w);
        var s = g[o]["keylen"] + g[o]["ivlen"];
        var v = "";
        var u = null;
        for (; ;) {
            var q = CryptoJS.algo.MD5.create();
            if (u != null) {
                q.update(u)
            }
            q.update(p);
            q.update(r);
            u = q.finalize();
            v = v + CryptoJS.enc.Hex.stringify(u);
            if (v.length >= s * 2) {
                break
            }
        }
        var x = {};
        x.keyhex = v.substr(0, g[o]["keylen"] * 2);
        x.ivhex = v.substr(g[o]["keylen"] * 2, g[o]["ivlen"] * 2);
        return x
    };
    var a = function (n, t, p, u) {
        var q = CryptoJS.enc.Base64.parse(n);
        var o = CryptoJS.enc.Hex.stringify(q);
        var s = g[t]["proc"];
        var r = s(o, p, u);
        return r
    };
    var f = function (n, q, o, s) {
        var p = g[q]["eproc"];
        var r = p(n, o, s);
        return r
    };
    return {
        version: "1.0.5", getHexFromPEM: function (o, r) {
            var p = o;
            if (p.indexOf("BEGIN " + r) == -1) {
                throw"can't find PEM header: " + r
            }
            p = p.replace("-----BEGIN " + r + "-----", "");
            p = p.replace("-----END " + r + "-----", "");
            var q = p.replace(/\s+/g, "");
            var n = b64tohex(q);
            return n
        }, getDecryptedKeyHexByKeyIV: function (o, r, q, p) {
            var n = b(r);
            return n(o, q, p)
        }, parsePKCS5PEM: function (n) {
            return l(n)
        }, getKeyAndUnusedIvByPasscodeAndIvsalt: function (o, n, p) {
            return h(o, n, p)
        }, decryptKeyB64: function (n, p, o, q) {
            return a(n, p, o, q)
        }, getDecryptedKeyHex: function (w, v) {
            var o = l(w);
            var r = o.type;
            var p = o.cipher;
            var n = o.ivsalt;
            var q = o.data;
            var u = h(p, v, n);
            var t = u.keyhex;
            var s = a(q, p, t, n);
            return s
        }, getRSAKeyFromEncryptedPKCS5PEM: function (p, o) {
            var q = this.getDecryptedKeyHex(p, o);
            var n = new RSAKey();
            n.readPrivateKeyFromASN1HexString(q);
            return n
        }, getEryptedPKCS5PEMFromPrvKeyHex: function (q, x, r, p) {
            var n = "";
            if (typeof r == "undefined" || r == null) {
                r = "AES-256-CBC"
            }
            if (typeof g[r] == "undefined") {
                throw"PKCS5PKEY unsupported algorithm: " + r
            }
            if (typeof p == "undefined" || p == null) {
                var t = g[r]["ivlen"];
                var s = k(t);
                p = s.toUpperCase()
            }
            var w = h(r, x, p);
            var v = w.keyhex;
            var u = f(q, r, v, p);
            var o = u.replace(/(.{64})/g, "$1\r\n");
            var n = "-----BEGIN RSA PRIVATE KEY-----\r\n";
            n += "Proc-Type: 4,ENCRYPTED\r\n";
            n += "DEK-Info: " + r + "," + p + "\r\n";
            n += "\r\n";
            n += o;
            n += "\r\n-----END RSA PRIVATE KEY-----\r\n";
            return n
        }, getEryptedPKCS5PEMFromRSAKey: function (C, D, o, s) {
            var A = new KJUR.asn1.DERInteger({"int": 0});
            var v = new KJUR.asn1.DERInteger({bigint: C.n});
            var z = new KJUR.asn1.DERInteger({"int": C.e});
            var B = new KJUR.asn1.DERInteger({bigint: C.d});
            var t = new KJUR.asn1.DERInteger({bigint: C.p});
            var r = new KJUR.asn1.DERInteger({bigint: C.q});
            var y = new KJUR.asn1.DERInteger({bigint: C.dmp1});
            var u = new KJUR.asn1.DERInteger({bigint: C.dmq1});
            var x = new KJUR.asn1.DERInteger({bigint: C.coeff});
            var E = new KJUR.asn1.DERSequence({array: [A, v, z, B, t, r, y, u, x]});
            var w = E.getEncodedHex();
            return this.getEryptedPKCS5PEMFromPrvKeyHex(w, D, o, s)
        }, newEncryptedPKCS5PEM: function (n, o, r, s) {
            if (typeof o == "undefined" || o == null) {
                o = 1024
            }
            if (typeof r == "undefined" || r == null) {
                r = "10001"
            }
            var p = new RSAKey();
            p.generate(o, r);
            var q = null;
            if (typeof s == "undefined" || s == null) {
                q = this.getEncryptedPKCS5PEMFromRSAKey(pkey, n)
            } else {
                q = this.getEncryptedPKCS5PEMFromRSAKey(pkey, n, s)
            }
            return q
        }, getRSAKeyFromPlainPKCS8PEM: function (p) {
            if (p.match(/ENCRYPTED/)) {
                throw"pem shall be not ENCRYPTED"
            }
            var o = this.getHexFromPEM(p, "PRIVATE KEY");
            var n = this.getRSAKeyFromPlainPKCS8Hex(o);
            return n
        }, getRSAKeyFromPlainPKCS8Hex: function (q) {
            var p = ASN1HEX.getPosArrayOfChildren_AtObj(q, 0);
            if (p.length != 3) {
                throw"outer DERSequence shall have 3 elements: " + p.length
            }
            var o = ASN1HEX.getHexOfTLV_AtObj(q, p[1]);
            if (o != "300d06092a864886f70d0101010500") {
                throw"PKCS8 AlgorithmIdentifier is not rsaEnc: " + o
            }
            var o = ASN1HEX.getHexOfTLV_AtObj(q, p[1]);
            var r = ASN1HEX.getHexOfTLV_AtObj(q, p[2]);
            var s = ASN1HEX.getHexOfV_AtObj(r, 0);
            var n = new RSAKey();
            n.readPrivateKeyFromASN1HexString(s);
            return n
        }, parseHexOfEncryptedPKCS8: function (u) {
            var q = {};
            var p = ASN1HEX.getPosArrayOfChildren_AtObj(u, 0);
            if (p.length != 2) {
                throw"malformed format: SEQUENCE(0).items != 2: " + p.length
            }
            q.ciphertext = ASN1HEX.getHexOfV_AtObj(u, p[1]);
            var w = ASN1HEX.getPosArrayOfChildren_AtObj(u, p[0]);
            if (w.length != 2) {
                throw"malformed format: SEQUENCE(0.0).items != 2: " + w.length
            }
            if (ASN1HEX.getHexOfV_AtObj(u, w[0]) != "2a864886f70d01050d") {
                throw"this only supports pkcs5PBES2"
            }
            var n = ASN1HEX.getPosArrayOfChildren_AtObj(u, w[1]);
            if (w.length != 2) {
                throw"malformed format: SEQUENCE(0.0.1).items != 2: " + n.length
            }
            var o = ASN1HEX.getPosArrayOfChildren_AtObj(u, n[1]);
            if (o.length != 2) {
                throw"malformed format: SEQUENCE(0.0.1.1).items != 2: " + o.length
            }
            if (ASN1HEX.getHexOfV_AtObj(u, o[0]) != "2a864886f70d0307") {
                throw"this only supports TripleDES"
            }
            q.encryptionSchemeAlg = "TripleDES";
            q.encryptionSchemeIV = ASN1HEX.getHexOfV_AtObj(u, o[1]);
            var r = ASN1HEX.getPosArrayOfChildren_AtObj(u, n[0]);
            if (r.length != 2) {
                throw"malformed format: SEQUENCE(0.0.1.0).items != 2: " + r.length
            }
            if (ASN1HEX.getHexOfV_AtObj(u, r[0]) != "2a864886f70d01050c") {
                throw"this only supports pkcs5PBKDF2"
            }
            var v = ASN1HEX.getPosArrayOfChildren_AtObj(u, r[1]);
            if (v.length < 2) {
                throw"malformed format: SEQUENCE(0.0.1.0.1).items < 2: " + v.length
            }
            q.pbkdf2Salt = ASN1HEX.getHexOfV_AtObj(u, v[0]);
            var s = ASN1HEX.getHexOfV_AtObj(u, v[1]);
            try {
                q.pbkdf2Iter = parseInt(s, 16)
            } catch (t) {
                throw"malformed format pbkdf2Iter: " + s
            }
            return q
        }, getPBKDF2KeyHexFromParam: function (s, n) {
            var r = CryptoJS.enc.Hex.parse(s.pbkdf2Salt);
            var o = s.pbkdf2Iter;
            var q = CryptoJS.PBKDF2(n, r, {keySize: 192 / 32, iterations: o});
            var p = CryptoJS.enc.Hex.stringify(q);
            return p
        }, getPlainPKCS8HexFromEncryptedPKCS8PEM: function (v, w) {
            var p = this.getHexFromPEM(v, "ENCRYPTED PRIVATE KEY");
            var n = this.parseHexOfEncryptedPKCS8(p);
            var s = PKCS5PKEY.getPBKDF2KeyHexFromParam(n, w);
            var t = {};
            t.ciphertext = CryptoJS.enc.Hex.parse(n.ciphertext);
            var r = CryptoJS.enc.Hex.parse(s);
            var q = CryptoJS.enc.Hex.parse(n.encryptionSchemeIV);
            var u = CryptoJS.TripleDES.decrypt(t, r, {iv: q});
            var o = CryptoJS.enc.Hex.stringify(u);
            return o
        }, getRSAKeyFromEncryptedPKCS8PEM: function (q, p) {
            var o = this.getPlainPKCS8HexFromEncryptedPKCS8PEM(q, p);
            var n = this.getRSAKeyFromPlainPKCS8Hex(o);
            return n
        }, getKeyFromEncryptedPKCS8PEM: function (q, o) {
            var n = this.getPlainPKCS8HexFromEncryptedPKCS8PEM(q, o);
            var p = this.getKeyFromPlainPrivatePKCS8Hex(n);
            return p
        }, parsePlainPrivatePKCS8Hex: function (q) {
            var o = {};
            o.algparam = null;
            if (q.substr(0, 2) != "30") {
                throw"malformed plain PKCS8 private key(code:001)"
            }
            var p = ASN1HEX.getPosArrayOfChildren_AtObj(q, 0);
            if (p.length != 3) {
                throw"malformed plain PKCS8 private key(code:002)"
            }
            if (q.substr(p[1], 2) != "30") {
                throw"malformed PKCS8 private key(code:003)"
            }
            var n = ASN1HEX.getPosArrayOfChildren_AtObj(q, p[1]);
            if (n.length != 2) {
                throw"malformed PKCS8 private key(code:004)"
            }
            if (q.substr(n[0], 2) != "06") {
                throw"malformed PKCS8 private key(code:005)"
            }
            o.algoid = ASN1HEX.getHexOfV_AtObj(q, n[0]);
            if (q.substr(n[1], 2) == "06") {
                o.algparam = ASN1HEX.getHexOfV_AtObj(q, n[1])
            }
            if (q.substr(p[2], 2) != "04") {
                throw"malformed PKCS8 private key(code:006)"
            }
            o.keyidx = ASN1HEX.getStartPosOfV_AtObj(q, p[2]);
            return o
        }, getKeyFromPlainPrivatePKCS8PEM: function (o) {
            var n = this.getHexFromPEM(o, "PRIVATE KEY");
            var p = this.getKeyFromPlainPrivatePKCS8Hex(n);
            return p
        }, getKeyFromPlainPrivatePKCS8Hex: function (n) {
            var p = this.parsePlainPrivatePKCS8Hex(n);
            if (p.algoid == "2a864886f70d010101") {
                this.parsePrivateRawRSAKeyHexAtObj(n, p);
                var o = p.key;
                var q = new RSAKey();
                q.setPrivateEx(o.n, o.e, o.d, o.p, o.q, o.dp, o.dq, o.co);
                return q
            } else {
                if (p.algoid == "2a8648ce3d0201") {
                    this.parsePrivateRawECKeyHexAtObj(n, p);
                    if (KJUR.crypto.OID.oidhex2name[p.algparam] === undefined) {
                        throw"KJUR.crypto.OID.oidhex2name undefined: " + p.algparam
                    }
                    var r = KJUR.crypto.OID.oidhex2name[p.algparam];
                    var q = new KJUR.crypto.ECDSA({curve: r, prv: p.key});
                    return q
                } else {
                    throw"unsupported private key algorithm"
                }
            }
        }, getRSAKeyFromPublicPKCS8PEM: function (o) {
            var p = this.getHexFromPEM(o, "PUBLIC KEY");
            var n = this.getRSAKeyFromPublicPKCS8Hex(p);
            return n
        }, getKeyFromPublicPKCS8PEM: function (o) {
            var p = this.getHexFromPEM(o, "PUBLIC KEY");
            var n = this.getKeyFromPublicPKCS8Hex(p);
            return n
        }, getKeyFromPublicPKCS8Hex: function (o) {
            var n = this.parsePublicPKCS8Hex(o);
            if (n.algoid == "2a864886f70d010101") {
                var r = this.parsePublicRawRSAKeyHex(n.key);
                var p = new RSAKey();
                p.setPublic(r.n, r.e);
                return p
            } else {
                if (n.algoid == "2a8648ce3d0201") {
                    if (KJUR.crypto.OID.oidhex2name[n.algparam] === undefined) {
                        throw"KJUR.crypto.OID.oidhex2name undefined: " + n.algparam
                    }
                    var q = KJUR.crypto.OID.oidhex2name[n.algparam];
                    var p = new KJUR.crypto.ECDSA({curve: q, pub: n.key});
                    return p
                } else {
                    throw"unsupported public key algorithm"
                }
            }
        }, parsePublicRawRSAKeyHex: function (p) {
            var n = {};
            if (p.substr(0, 2) != "30") {
                throw"malformed RSA key(code:001)"
            }
            var o = ASN1HEX.getPosArrayOfChildren_AtObj(p, 0);
            if (o.length != 2) {
                throw"malformed RSA key(code:002)"
            }
            if (p.substr(o[0], 2) != "02") {
                throw"malformed RSA key(code:003)"
            }
            n.n = ASN1HEX.getHexOfV_AtObj(p, o[0]);
            if (p.substr(o[1], 2) != "02") {
                throw"malformed RSA key(code:004)"
            }
            n.e = ASN1HEX.getHexOfV_AtObj(p, o[1]);
            return n
        }, parsePrivateRawRSAKeyHexAtObj: function (o, q) {
            var p = q.keyidx;
            if (o.substr(p, 2) != "30") {
                throw"malformed RSA private key(code:001)"
            }
            var n = ASN1HEX.getPosArrayOfChildren_AtObj(o, p);
            if (n.length != 9) {
                throw"malformed RSA private key(code:002)"
            }
            q.key = {};
            q.key.n = ASN1HEX.getHexOfV_AtObj(o, n[1]);
            q.key.e = ASN1HEX.getHexOfV_AtObj(o, n[2]);
            q.key.d = ASN1HEX.getHexOfV_AtObj(o, n[3]);
            q.key.p = ASN1HEX.getHexOfV_AtObj(o, n[4]);
            q.key.q = ASN1HEX.getHexOfV_AtObj(o, n[5]);
            q.key.dp = ASN1HEX.getHexOfV_AtObj(o, n[6]);
            q.key.dq = ASN1HEX.getHexOfV_AtObj(o, n[7]);
            q.key.co = ASN1HEX.getHexOfV_AtObj(o, n[8])
        }, parsePrivateRawECKeyHexAtObj: function (o, q) {
            var p = q.keyidx;
            if (o.substr(p, 2) != "30") {
                throw"malformed ECC private key(code:001)"
            }
            var n = ASN1HEX.getPosArrayOfChildren_AtObj(o, p);
            if (n.length != 3) {
                throw"malformed ECC private key(code:002)"
            }
            if (o.substr(n[1], 2) != "04") {
                throw"malformed ECC private key(code:003)"
            }
            q.key = ASN1HEX.getHexOfV_AtObj(o, n[1])
        }, parsePublicPKCS8Hex: function (q) {
            var o = {};
            o.algparam = null;
            var p = ASN1HEX.getPosArrayOfChildren_AtObj(q, 0);
            if (p.length != 2) {
                throw"outer DERSequence shall have 2 elements: " + p.length
            }
            var r = p[0];
            if (q.substr(r, 2) != "30") {
                throw"malformed PKCS8 public key(code:001)"
            }
            var n = ASN1HEX.getPosArrayOfChildren_AtObj(q, r);
            if (n.length != 2) {
                throw"malformed PKCS8 public key(code:002)"
            }
            if (q.substr(n[0], 2) != "06") {
                throw"malformed PKCS8 public key(code:003)"
            }
            o.algoid = ASN1HEX.getHexOfV_AtObj(q, n[0]);
            if (q.substr(n[1], 2) == "06") {
                o.algparam = ASN1HEX.getHexOfV_AtObj(q, n[1])
            }
            if (q.substr(p[1], 2) != "03") {
                throw"malformed PKCS8 public key(code:004)"
            }
            o.key = ASN1HEX.getHexOfV_AtObj(q, p[1]).substr(2);
            return o
        }, getRSAKeyFromPublicPKCS8Hex: function (r) {
            var q = ASN1HEX.getPosArrayOfChildren_AtObj(r, 0);
            if (q.length != 2) {
                throw"outer DERSequence shall have 2 elements: " + q.length
            }
            var p = ASN1HEX.getHexOfTLV_AtObj(r, q[0]);
            if (p != "300d06092a864886f70d0101010500") {
                throw"PKCS8 AlgorithmId is not rsaEncryption"
            }
            if (r.substr(q[1], 2) != "03") {
                throw"PKCS8 Public Key is not BITSTRING encapslated."
            }
            var t = ASN1HEX.getStartPosOfV_AtObj(r, q[1]) + 2;
            if (r.substr(t, 2) != "30") {
                throw"PKCS8 Public Key is not SEQUENCE."
            }
            var n = ASN1HEX.getPosArrayOfChildren_AtObj(r, t);
            if (n.length != 2) {
                throw"inner DERSequence shall have 2 elements: " + n.length
            }
            if (r.substr(n[0], 2) != "02") {
                throw"N is not ASN.1 INTEGER"
            }
            if (r.substr(n[1], 2) != "02") {
                throw"E is not ASN.1 INTEGER"
            }
            var u = ASN1HEX.getHexOfV_AtObj(r, n[0]);
            var s = ASN1HEX.getHexOfV_AtObj(r, n[1]);
            var o = new RSAKey();
            o.setPublic(u, s);
            return o
        },
    }
}();
/*! rsapem-1.1.js (c) 2012 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
function _rsapem_pemToBase64(b) {
    var a = b;
    a = a.replace("-----BEGIN RSA PRIVATE KEY-----", "");
    a = a.replace("-----END RSA PRIVATE KEY-----", "");
    a = a.replace(/[ \n]+/g, "");
    return a
}
function _rsapem_getPosArrayOfChildrenFromHex(d) {
    var j = new Array();
    var k = ASN1HEX.getStartPosOfV_AtObj(d, 0);
    var f = ASN1HEX.getPosOfNextSibling_AtObj(d, k);
    var h = ASN1HEX.getPosOfNextSibling_AtObj(d, f);
    var b = ASN1HEX.getPosOfNextSibling_AtObj(d, h);
    var l = ASN1HEX.getPosOfNextSibling_AtObj(d, b);
    var e = ASN1HEX.getPosOfNextSibling_AtObj(d, l);
    var g = ASN1HEX.getPosOfNextSibling_AtObj(d, e);
    var c = ASN1HEX.getPosOfNextSibling_AtObj(d, g);
    var i = ASN1HEX.getPosOfNextSibling_AtObj(d, c);
    j.push(k, f, h, b, l, e, g, c, i);
    return j
}
function _rsapem_getHexValueArrayOfChildrenFromHex(i) {
    var o = _rsapem_getPosArrayOfChildrenFromHex(i);
    var r = ASN1HEX.getHexOfV_AtObj(i, o[0]);
    var f = ASN1HEX.getHexOfV_AtObj(i, o[1]);
    var j = ASN1HEX.getHexOfV_AtObj(i, o[2]);
    var k = ASN1HEX.getHexOfV_AtObj(i, o[3]);
    var c = ASN1HEX.getHexOfV_AtObj(i, o[4]);
    var b = ASN1HEX.getHexOfV_AtObj(i, o[5]);
    var h = ASN1HEX.getHexOfV_AtObj(i, o[6]);
    var g = ASN1HEX.getHexOfV_AtObj(i, o[7]);
    var l = ASN1HEX.getHexOfV_AtObj(i, o[8]);
    var m = new Array();
    m.push(r, f, j, k, c, b, h, g, l);
    return m
}
function _rsapem_readPrivateKeyFromASN1HexString(c) {
    var b = _rsapem_getHexValueArrayOfChildrenFromHex(c);
    this.setPrivateEx(b[1], b[2], b[3], b[4], b[5], b[6], b[7], b[8])
}
function _rsapem_readPrivateKeyFromPEMString(e) {
    var c = _rsapem_pemToBase64(e);
    var d = b64tohex(c);
    var b = _rsapem_getHexValueArrayOfChildrenFromHex(d);
    this.setPrivateEx(b[1], b[2], b[3], b[4], b[5], b[6], b[7], b[8])
}
RSAKey.prototype.readPrivateKeyFromPEMString = _rsapem_readPrivateKeyFromPEMString;
RSAKey.prototype.readPrivateKeyFromASN1HexString = _rsapem_readPrivateKeyFromASN1HexString;
/*! rsasign-1.2.7.js (c) 2012 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
var _RE_HEXDECONLY = new RegExp("");
_RE_HEXDECONLY.compile("[^0-9a-f]", "gi");
function _rsasign_getHexPaddedDigestInfoForString(d, e, a) {
    var b = function (f) {
        return KJUR.crypto.Util.hashString(f, a)
    };
    var c = b(d);
    return KJUR.crypto.Util.getPaddedDigestInfoHex(c, a, e)
}
function _zeroPaddingOfSignature(e, d) {
    var c = "";
    var a = d / 4 - e.length;
    for (var b = 0; b < a; b++) {
        c = c + "0"
    }
    return c + e
}
function _rsasign_signString(d, a) {
    var b = function (e) {
        return KJUR.crypto.Util.hashString(e, a)
    };
    var c = b(d);
    return this.signWithMessageHash(c, a)
}
function _rsasign_signWithMessageHash(e, c) {
    var f = KJUR.crypto.Util.getPaddedDigestInfoHex(e, c, this.n.bitLength());
    var b = parseBigInt(f, 16);
    var d = this.doPrivate(b);
    var a = d.toString(16);
    return _zeroPaddingOfSignature(a, this.n.bitLength())
}
function _rsasign_signStringWithSHA1(a) {
    return _rsasign_signString.call(this, a, "sha1")
}
function _rsasign_signStringWithSHA256(a) {
    return _rsasign_signString.call(this, a, "sha256")
}
function pss_mgf1_str(c, a, e) {
    var b = "", d = 0;
    while (b.length < a) {
        b += hextorstr(e(rstrtohex(c + String.fromCharCode.apply(String, [(d & 4278190080) >> 24, (d & 16711680) >> 16, (d & 65280) >> 8, d & 255]))));
        d += 1
    }
    return b
}
function _rsasign_signStringPSS(e, a, d) {
    var c = function (f) {
        return KJUR.crypto.Util.hashHex(f, a)
    };
    var b = c(rstrtohex(e));
    if (d === undefined) {
        d = -1
    }
    return this.signWithMessageHashPSS(b, a, d)
}
function _rsasign_signWithMessageHashPSS(l, a, k) {
    var b = hextorstr(l);
    var g = b.length;
    var m = this.n.bitLength() - 1;
    var c = Math.ceil(m / 8);
    var d;
    var o = function (i) {
        return KJUR.crypto.Util.hashHex(i, a)
    };
    if (k === -1 || k === undefined) {
        k = g
    } else {
        if (k === -2) {
            k = c - g - 2
        } else {
            if (k < -2) {
                throw"invalid salt length"
            }
        }
    }
    if (c < (g + k + 2)) {
        throw"data too long"
    }
    var f = "";
    if (k > 0) {
        f = new Array(k);
        new SecureRandom().nextBytes(f);
        f = String.fromCharCode.apply(String, f)
    }
    var n = hextorstr(o(rstrtohex("\x00\x00\x00\x00\x00\x00\x00\x00" + b + f)));
    var j = [];
    for (d = 0; d < c - k - g - 2; d += 1) {
        j[d] = 0
    }
    var e = String.fromCharCode.apply(String, j) + "\x01" + f;
    var h = pss_mgf1_str(n, e.length, o);
    var q = [];
    for (d = 0; d < e.length; d += 1) {
        q[d] = e.charCodeAt(d) ^ h.charCodeAt(d)
    }
    var p = (65280 >> (8 * c - m)) & 255;
    q[0] &= ~p;
    for (d = 0; d < g; d++) {
        q.push(n.charCodeAt(d))
    }
    q.push(188);
    return _zeroPaddingOfSignature(this.doPrivate(new BigInteger(q)).toString(16), this.n.bitLength())
}
function _rsasign_getDecryptSignatureBI(a, d, c) {
    var b = new RSAKey();
    b.setPublic(d, c);
    var e = b.doPublic(a);
    return e
}
function _rsasign_getHexDigestInfoFromSig(a, c, b) {
    var e = _rsasign_getDecryptSignatureBI(a, c, b);
    var d = e.toString(16).replace(/^1f+00/, "");
    return d
}
function _rsasign_getAlgNameAndHashFromHexDisgestInfo(f) {
    for (var e in KJUR.crypto.Util.DIGESTINFOHEAD) {
        var d = KJUR.crypto.Util.DIGESTINFOHEAD[e];
        var b = d.length;
        if (f.substring(0, b) == d) {
            var c = [e, f.substring(b)];
            return c
        }
    }
    return []
}
function _rsasign_verifySignatureWithArgs(f, b, g, j) {
    var e = _rsasign_getHexDigestInfoFromSig(b, g, j);
    var h = _rsasign_getAlgNameAndHashFromHexDisgestInfo(e);
    if (h.length == 0) {
        return false
    }
    var d = h[0];
    var i = h[1];
    var a = function (k) {
        return KJUR.crypto.Util.hashString(k, d)
    };
    var c = a(f);
    return (i == c)
}
function _rsasign_verifyHexSignatureForMessage(c, b) {
    var d = parseBigInt(c, 16);
    var a = _rsasign_verifySignatureWithArgs(b, d, this.n.toString(16), this.e.toString(16));
    return a
}
function _rsasign_verifyString(f, j) {
    j = j.replace(_RE_HEXDECONLY, "");
    j = j.replace(/[ \n]+/g, "");
    var b = parseBigInt(j, 16);
    if (b.bitLength() > this.n.bitLength()) {
        return 0
    }
    var i = this.doPublic(b);
    var e = i.toString(16).replace(/^1f+00/, "");
    var g = _rsasign_getAlgNameAndHashFromHexDisgestInfo(e);
    if (g.length == 0) {
        return false
    }
    var d = g[0];
    var h = g[1];
    var a = function (k) {
        return KJUR.crypto.Util.hashString(k, d)
    };
    var c = a(f);
    return (h == c)
}
function _rsasign_verifyWithMessageHash(e, a) {
    a = a.replace(_RE_HEXDECONLY, "");
    a = a.replace(/[ \n]+/g, "");
    var b = parseBigInt(a, 16);
    if (b.bitLength() > this.n.bitLength()) {
        return 0
    }
    var h = this.doPublic(b);
    var g = h.toString(16).replace(/^1f+00/, "");
    var c = _rsasign_getAlgNameAndHashFromHexDisgestInfo(g);
    if (c.length == 0) {
        return false
    }
    var d = c[0];
    var f = c[1];
    return (f == e)
}
function _rsasign_verifyStringPSS(c, b, a, f) {
    var e = function (g) {
        return KJUR.crypto.Util.hashHex(g, a)
    };
    var d = e(rstrtohex(c));
    if (f === undefined) {
        f = -1
    }
    return this.verifyWithMessageHashPSS(d, b, a, f)
}
function _rsasign_verifyWithMessageHashPSS(f, s, l, c) {
    var k = new BigInteger(s, 16);
    if (k.bitLength() > this.n.bitLength()) {
        return false
    }
    var r = function (i) {
        return KJUR.crypto.Util.hashHex(i, l)
    };
    var j = hextorstr(f);
    var h = j.length;
    var g = this.n.bitLength() - 1;
    var m = Math.ceil(g / 8);
    var q;
    if (c === -1 || c === undefined) {
        c = h
    } else {
        if (c === -2) {
            c = m - h - 2
        } else {
            if (c < -2) {
                throw"invalid salt length"
            }
        }
    }
    if (m < (h + c + 2)) {
        throw"data too long"
    }
    var a = this.doPublic(k).toByteArray();
    for (q = 0; q < a.length; q += 1) {
        a[q] &= 255
    }
    while (a.length < m) {
        a.unshift(0)
    }
    if (a[m - 1] !== 188) {
        throw"encoded message does not end in 0xbc"
    }
    a = String.fromCharCode.apply(String, a);
    var d = a.substr(0, m - h - 1);
    var e = a.substr(d.length, h);
    var p = (65280 >> (8 * m - g)) & 255;
    if ((d.charCodeAt(0) & p) !== 0) {
        throw"bits beyond keysize not zero"
    }
    var n = pss_mgf1_str(e, d.length, r);
    var o = [];
    for (q = 0; q < d.length; q += 1) {
        o[q] = d.charCodeAt(q) ^ n.charCodeAt(q)
    }
    o[0] &= ~p;
    var b = m - h - c - 2;
    for (q = 0; q < b; q += 1) {
        if (o[q] !== 0) {
            throw"leftmost octets not zero"
        }
    }
    if (o[b] !== 1) {
        throw"0x01 marker not found"
    }
    return e === hextorstr(r(rstrtohex("\x00\x00\x00\x00\x00\x00\x00\x00" + j + String.fromCharCode.apply(String, o.slice(-c)))))
}
RSAKey.prototype.signWithMessageHash = _rsasign_signWithMessageHash;
RSAKey.prototype.signString = _rsasign_signString;
RSAKey.prototype.signStringWithSHA1 = _rsasign_signStringWithSHA1;
RSAKey.prototype.signStringWithSHA256 = _rsasign_signStringWithSHA256;
RSAKey.prototype.sign = _rsasign_signString;
RSAKey.prototype.signWithSHA1 = _rsasign_signStringWithSHA1;
RSAKey.prototype.signWithSHA256 = _rsasign_signStringWithSHA256;
RSAKey.prototype.signWithMessageHashPSS = _rsasign_signWithMessageHashPSS;
RSAKey.prototype.signStringPSS = _rsasign_signStringPSS;
RSAKey.prototype.signPSS = _rsasign_signStringPSS;
RSAKey.SALT_LEN_HLEN = -1;
RSAKey.SALT_LEN_MAX = -2;
RSAKey.prototype.verifyWithMessageHash = _rsasign_verifyWithMessageHash;
RSAKey.prototype.verifyString = _rsasign_verifyString;
RSAKey.prototype.verifyHexSignatureForMessage = _rsasign_verifyHexSignatureForMessage;
RSAKey.prototype.verify = _rsasign_verifyString;
RSAKey.prototype.verifyHexSignatureForByteArrayMessage = _rsasign_verifyHexSignatureForMessage;
RSAKey.prototype.verifyWithMessageHashPSS = _rsasign_verifyWithMessageHashPSS;
RSAKey.prototype.verifyStringPSS = _rsasign_verifyStringPSS;
RSAKey.prototype.verifyPSS = _rsasign_verifyStringPSS;
RSAKey.SALT_LEN_RECOVER = -2;
/*! x509-1.1.1.js (c) 2012 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
function X509() {
    this.subjectPublicKeyRSA = null;
    this.subjectPublicKeyRSA_hN = null;
    this.subjectPublicKeyRSA_hE = null;
    this.hex = null;
    this.getSerialNumberHex = function () {
        return ASN1HEX.getDecendantHexVByNthList(this.hex, 0, [0, 1])
    };
    this.getIssuerHex = function () {
        return ASN1HEX.getDecendantHexTLVByNthList(this.hex, 0, [0, 3])
    };
    this.getIssuerString = function () {
        return X509.hex2dn(ASN1HEX.getDecendantHexTLVByNthList(this.hex, 0, [0, 3]))
    };
    this.getSubjectHex = function () {
        return ASN1HEX.getDecendantHexTLVByNthList(this.hex, 0, [0, 5])
    };
    this.getSubjectString = function () {
        return X509.hex2dn(ASN1HEX.getDecendantHexTLVByNthList(this.hex, 0, [0, 5]))
    };
    this.getNotBefore = function () {
        var a = ASN1HEX.getDecendantHexVByNthList(this.hex, 0, [0, 4, 0]);
        a = a.replace(/(..)/g, "%$1");
        a = decodeURIComponent(a);
        return a
    };
    this.getNotAfter = function () {
        var a = ASN1HEX.getDecendantHexVByNthList(this.hex, 0, [0, 4, 1]);
        a = a.replace(/(..)/g, "%$1");
        a = decodeURIComponent(a);
        return a
    };
    this.readCertPEM = function (c) {
        var e = X509.pemToHex(c);
        var b = X509.getPublicKeyHexArrayFromCertHex(e);
        var d = new RSAKey();
        d.setPublic(b[0], b[1]);
        this.subjectPublicKeyRSA = d;
        this.subjectPublicKeyRSA_hN = b[0];
        this.subjectPublicKeyRSA_hE = b[1];
        this.hex = e
    };
    this.readCertPEMWithoutRSAInit = function (c) {
        var d = X509.pemToHex(c);
        var b = X509.getPublicKeyHexArrayFromCertHex(d);
        this.subjectPublicKeyRSA.setPublic(b[0], b[1]);
        this.subjectPublicKeyRSA_hN = b[0];
        this.subjectPublicKeyRSA_hE = b[1];
        this.hex = d
    }
}
X509.pemToBase64 = function (a) {
    var b = a;
    b = b.replace("-----BEGIN CERTIFICATE-----", "");
    b = b.replace("-----END CERTIFICATE-----", "");
    b = b.replace(/[ \n]+/g, "");
    return b
};
X509.pemToHex = function (a) {
    var c = X509.pemToBase64(a);
    var b = b64tohex(c);
    return b
};
X509.getSubjectPublicKeyPosFromCertHex = function (f) {
    var e = X509.getSubjectPublicKeyInfoPosFromCertHex(f);
    if (e == -1) {
        return -1
    }
    var b = ASN1HEX.getPosArrayOfChildren_AtObj(f, e);
    if (b.length != 2) {
        return -1
    }
    var d = b[1];
    if (f.substring(d, d + 2) != "03") {
        return -1
    }
    var c = ASN1HEX.getStartPosOfV_AtObj(f, d);
    if (f.substring(c, c + 2) != "00") {
        return -1
    }
    return c + 2
};
X509.getSubjectPublicKeyInfoPosFromCertHex = function (d) {
    var c = ASN1HEX.getStartPosOfV_AtObj(d, 0);
    var b = ASN1HEX.getPosArrayOfChildren_AtObj(d, c);
    if (b.length < 1) {
        return -1
    }
    if (d.substring(b[0], b[0] + 10) == "a003020102") {
        if (b.length < 6) {
            return -1
        }
        return b[6]
    } else {
        if (b.length < 5) {
            return -1
        }
        return b[5]
    }
};
X509.getPublicKeyHexArrayFromCertHex = function (f) {
    var e = X509.getSubjectPublicKeyPosFromCertHex(f);
    var b = ASN1HEX.getPosArrayOfChildren_AtObj(f, e);
    if (b.length != 2) {
        return []
    }
    var d = ASN1HEX.getHexOfV_AtObj(f, b[0]);
    var c = ASN1HEX.getHexOfV_AtObj(f, b[1]);
    if (d != null && c != null) {
        return [d, c]
    } else {
        return []
    }
};
X509.getHexTbsCertificateFromCert = function (b) {
    var a = ASN1HEX.getStartPosOfV_AtObj(b, 0);
    return a
};
X509.getPublicKeyHexArrayFromCertPEM = function (c) {
    var d = X509.pemToHex(c);
    var b = X509.getPublicKeyHexArrayFromCertHex(d);
    return b
};
X509.hex2dn = function (e) {
    var f = "";
    var c = ASN1HEX.getPosArrayOfChildren_AtObj(e, 0);
    for (var d = 0; d < c.length; d++) {
        var b = ASN1HEX.getHexOfTLV_AtObj(e, c[d]);
        f = f + "/" + X509.hex2rdn(b)
    }
    return f
};
X509.hex2rdn = function (a) {
    var f = ASN1HEX.getDecendantHexTLVByNthList(a, 0, [0, 0]);
    var e = ASN1HEX.getDecendantHexVByNthList(a, 0, [0, 1]);
    var c = "";
    try {
        c = X509.DN_ATTRHEX[f]
    } catch (b) {
        c = f
    }
    e = e.replace(/(..)/g, "%$1");
    var d = decodeURIComponent(e);
    return c + "=" + d
};
X509.DN_ATTRHEX = {
    "0603550406": "C",
    "060355040a": "O",
    "060355040b": "OU",
    "0603550403": "CN",
    "0603550405": "SN",
    "0603550408": "ST",
    "0603550407": "L",
};
X509.getPublicKeyFromCertPEM = function (a) {
    var d = X509.getPublicKeyInfoPropOfCertPEM(a);
    if (d.algoid == "2a864886f70d010101") {
        var e = PKCS5PKEY.parsePublicRawRSAKeyHex(d.keyhex);
        var b = new RSAKey();
        b.setPublic(e.n, e.e);
        return b
    } else {
        if (d.algoid = "2a8648ce3d0201") {
            var c = KJUR.crypto.OID.oidhex2name[d.algparam];
            var b = new KJUR.crypto.ECDSA({curve: c, info: d.keyhex});
            b.setPublicKeyHex(d.keyhex);
            return b
        } else {
            throw"unsupported key"
        }
    }
};
X509.getPublicKeyInfoPropOfCertPEM = function (e) {
    var c = {};
    c.algparam = null;
    var g = X509.pemToHex(e);
    var d = ASN1HEX.getPosArrayOfChildren_AtObj(g, 0);
    if (d.length != 3) {
        throw"malformed X.509 certificate PEM (code:001)"
    }
    if (g.substr(d[0], 2) != "30") {
        throw"malformed X.509 certificate PEM (code:002)"
    }
    var b = ASN1HEX.getPosArrayOfChildren_AtObj(g, d[0]);
    if (b.length < 7) {
        throw"malformed X.509 certificate PEM (code:003)"
    }
    var h = ASN1HEX.getPosArrayOfChildren_AtObj(g, b[6]);
    if (h.length != 2) {
        throw"malformed X.509 certificate PEM (code:004)"
    }
    var f = ASN1HEX.getPosArrayOfChildren_AtObj(g, h[0]);
    if (f.length != 2) {
        throw"malformed X.509 certificate PEM (code:005)"
    }
    c.algoid = ASN1HEX.getHexOfV_AtObj(g, f[0]);
    if (g.substr(f[1], 2) == "06") {
        c.algparam = ASN1HEX.getHexOfV_AtObj(g, f[1])
    }
    if (g.substr(h[1], 2) != "03") {
        throw"malformed X.509 certificate PEM (code:006)"
    }
    var a = ASN1HEX.getHexOfV_AtObj(g, h[1]);
    c.keyhex = a.substr(2);
    return c
};