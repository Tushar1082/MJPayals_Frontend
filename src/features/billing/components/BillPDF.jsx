import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import {
    calculateItemAmount,
    calculateNetWeight,
    roundTo,
    roundToInt
} from '../../../utils/helpers/billingHelper.js';

// Register font globally
Font.register({
    family: "Roboto",
    fonts: [
        { src: "/fonts/Roboto-Regular.ttf", fontWeight: "normal" },
        { src: "/fonts/Roboto-Medium.ttf", fontWeight: "500" },
        { src: "/fonts/Roboto-Italic.ttf", fontStyle: "italic" },
    ],
});

const rupee = "\u20B9";

const stringFLCMaker = (str) => {
    if (!str) {
        return "";
    }

    const strArr = str.split(" ");

    // Capitalize the first letter of each word
    const word = strArr
        .map((elm) => {
            return elm.charAt(0).toUpperCase() + elm.slice(1).toLowerCase();
        })
        .join(" ");

    return word;
};

function formatIndianAmount(amount) {
    return Number(amount).toLocaleString("en-IN", {
        maximumFractionDigits: 0,
    });
}

const calculateAmount = (item, silverRate) => {
    const { amount } = calculateItemAmount('R', {
        grossWeight: item.weight,
        ppRows: item.ppRows,
        rateGm: item.rateGm,
        rateKg: item.rateKg,
        ratePer: item.ratePer,
        silverRate: silverRate,
        labourType: null,
        labourRate: 0,
        labourNumPieces: 0
    });

    return amount;
};

const formatNoRound = (num, decimals = 2) => {
    return roundTo(num, decimals);  // ✅ Use helper
};

function parseUTC(input) {
    if (!input) return new Date();

    // If already a Date object
    if (input instanceof Date) return input;

    // If string, force UTC if missing
    const utcString = input.endsWith("Z") ? input : input + "Z";

    return new Date(utcString);
}

function billDate(input) {
    const date = parseUTC(input);

    return date
        .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
        .replace(/ /g, "-")
        .toLowerCase();
}

function billTime(input) {
    const date = parseUTC(input);

    return date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

const styles = StyleSheet.create({
    page: {
        paddingTop: 40,
        paddingBottom: 40,
        paddingLeft: 50,
        paddingRight: 50,
        fontFamily: "Roboto",
        fontSize: 9,
        backgroundColor: "#fff",
    },


    topHalf: {
        // height: "50%",
        width: "70%",
        margin: "0px auto"
    },

    rotatedWrapper: {
        height: "100%",
        transformOrigin: "center center",
    },

    invoiceBox: {
        borderWidth: 1,
        borderColor: "#000",
        padding: 14,
    },

    /* HEADER */
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    shopName: {
        fontSize: 12,
        fontWeight: "500",
        marginBottom: 0.5
    },

    shopText: {
        fontSize: 6,
        lineHeight: 1.4,
    },

    estPhyText: {
        fontSize: 7,
        lineHeight: 1.4,
    },

    rightText: {
        fontSize: 7,
        textAlign: "right",
        fontWeight: 'bold'
    },

    rightHeaderText: {
        fontSize: 7,
        textAlign: "right",
        fontWeight: 'bold'
    },

    divider: {
        borderTopWidth: 0.3,
        marginVertical: 8
    },

    rateText: {
        fontSize: 7,
        fontWeight: "500",
        marginBottom: 10,
        alignContent: 'center',
        justifyContent: 'center'
    },

    // sectionTitle: {
    //     fontSize: 10,
    //     fontWeight: "500",
    //     marginBottom: 6,
    // },

    /* ITEM BLOCK */
    itemBlock: {
        marginBottom: 8,
    },
    sectionHeader: {
        marginTop: 8,
        marginBottom: 4,
    },

    sectionHeader2: {
        marginTop: 4,
        marginBottom: 4,
    },

    sectionTitle: {
        fontSize: 8.5,
        fontWeight: "600",
        letterSpacing: 0.5,
    },

    itemName: {
        fontSize: 9,
        fontWeight: "400",
        marginBottom: 2,
    },

    itemRow: {
        flexDirection: "row",
        alignItems: 'flex-start'
    },

    weightBox: {
    },

    weightText: {
        flexDirection: 'row',
        fontSize: 8,
        lineHeight: 1.4,
    },

    rateSize: {
        fontSize: 8
    },

    rateBox: {
        fontSize: 7,
        flex: 1,
        gap: 1.5,
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "flex-end", // Changed from "center" to push rate to the right
        paddingRight: 20
        // justifyContent: "center"
    },

    mainRightHeader: {
        justifyContent: 'space-between'
    },

    silverRateBlockMain: {
        marginBottom: 0,
        alignItems: "flex-end",     // ⬅️ center the whole block
    },

    silverRateBlock: {
        alignItems: "center",     // ⬅️ center text horizontally
        justifyContent: "center", // ⬅️ center vertically
    },

    silverRateLabel: {
        fontSize: 8,
        fontWeight: "500",
        marginBottom: 1,
        textAlign: "center",      // ⬅️ important
    },

    silverRateValue: {
        fontSize: 8,
        fontWeight: "400",
        textAlign: "center",      // ⬅️ important
    },

    NameWtBox: {
        flex: 1.8
    },

    amountBox: {
        flex: 1,
        alignItems: "flex-end",
        justifyContent: "center",
    },

    amountText: {
        fontSize: 8,
        fontWeight: "400",
    },
    sectionDivider: {
        borderTopWidth: 0.4,
        marginBottom: 6,
    },
    itemDivider: {
        borderTopWidth: 0.3,
        marginTop: 6,
        color: 'lightgrey'
    },

    // totalsBox: {
    //     marginTop: 10,
    //     alignItems: "flex-end",
    // },

    totalsBox: {
        marginTop: 10,
        flexDirection: "row",            // Add this to make it a row
        justifyContent: "space-between", // Add this to push items to opposite corners
        alignItems: "flex-end",          // Aligns the bottoms of the text
    },
    totalsLeft: {
        flexDirection: "column",
        gap: 3,                          // Gives a tiny gap between Gross and Net lines
    },
    totalsRight: {
        alignItems: "flex-end",
    },

    totalText: {
        fontSize: 8.5,
    },

    netAmount: {
        fontSize: 9.5,
        fontWeight: "500",
        marginTop: 4,
    },

    footerDivider: {
        borderTopWidth: 0.3,
        marginVertical: 10,
    },

    footer: {
        marginTop: 20,
        textAlign: "center",
    },

    footerText: {
        fontSize: 8,
        textAlign: "center",
        fontStyle: "italic",
        lineHeight: 1.4,
    },

    footerSub: {
        fontSize: 6,
        textAlign: "center",
        color: "#555",
        marginTop: 4,
    },

    grTotalText: {
        fontSize: 8.5,
        marginBottom: 0.5
    }

});

export const BillPDF = ({ items, silverRate, invoiceDate, isPExists, isSExists }) => {

    function totalAmount() {
        let totalAm = 0;

        items.forEach((item) => {
            if (item.itemType === "S") {
                totalAm += calculateAmount(item, silverRate);
            } else if (item.itemType === "P") {
                totalAm -= calculateAmount(item, silverRate);
            }
        });

        return totalAm;
    }

    const totalRCND = items.reduce((sum, item) => {
        if (item.itemType == "P") {
            return sum + item.weight;
        }
        return sum;
    }, 0);

    const totalI = items.reduce((sum, item) => {
        if (item.itemType == "S") {
            return sum + item.weight;
        }
        return sum;
    }, 0);

    const totalIssItemsGross = items.reduce((sum, item) => {
        if (item.itemType == "P") return sum;

        return sum + item.weight;
    }, 0);

    const totalIssItemsNetWeight = items.reduce((sum, item) => {
        // Skip purchase items
        if (item.itemType == "P") return sum;

        const gross = Number(item.weight || 0);
        const net = calculateNetWeight(gross, item.ppRows);

        return sum + net;
    }, 0);

    const totalRcItemsGross = items.reduce((sum, item) => {
        if (item.itemType == "S") return sum;

        return sum + item.weight;
    }, 0);

    const totalRcItemsNetWeight = items.reduce((sum, item) => {
        if (item.itemType == "S") return sum;

        const gross = Number(item.weight || 0);
        const net = calculateNetWeight(gross, item.ppRows);

        return sum + net;
    }, 0);

    const hasValidPpRows = (item) => {
        return item?.ppRows?.some(
            (elm) => elm.count > 0 && elm.weight > 0
        ) || false;
    };



    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.topHalf}>
                    <View style={styles.rotatedWrapper}>
                        <View style={styles.invoiceBox}>
                            {/* HEADER */}
                            <View style={styles.headerRow}>
                                <View>
                                    <Text style={styles.estPhyText}>Estimate Only</Text>
                                    <Text style={styles.estPhyText}>No Physical Transaction</Text>
                                    <Text style={styles.shopName}>MJ Payals Jewellers</Text>
                                    <Text style={styles.shopText}>
                                        28/66, Seo ka Bazar, Agra
                                    </Text>
                                    <Text style={styles.shopText}>
                                        Phone: +91 8126394316
                                    </Text>
                                </View>

                                <View style={styles.mainRightHeader}>
                                    <View>
                                        <Text style={styles.rightHeaderText}>
                                            Date: {billDate(invoiceDate ?? new Date())}
                                        </Text>
                                        <Text style={styles.rightHeaderText}>
                                            Time: {billTime(invoiceDate ?? new Date())}
                                        </Text>
                                    </View>

                                    <View style={styles.silverRateBlockMain}>
                                        <View style={styles.silverRateBlock}>
                                            <Text style={styles.silverRateLabel}>
                                                Silver Rate
                                            </Text>

                                            <Text style={styles.silverRateValue}>
                                                {formatIndianAmount(silverRate)}/kg
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {isSExists && isPExists && <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>SELL</Text>
                                <View style={styles.sectionDivider} />
                            </View>}

                            {isSExists && !isPExists && <>
                                <View style={{ marginTop: 10 }}></View>
                                <View style={styles.sectionDivider} />
                            </>
                            }

                            {isSExists && items
                                .filter((item) => item.itemType != "P")
                                .map((item, idx) => {
                                    if (!item.itemName?.trim()) return null;
                                    // console.log(item);
                                    const gross = Number(item.weight || 0);
                                    const net = calculateNetWeight(gross, item.ppRows);

                                    return (
                                        <View key={idx} style={styles.itemBlock}>
                                            <Text style={styles.itemName}>{stringFLCMaker(item.itemName)}</Text>
                                            <View style={styles.itemRow}>
                                                {/* WEIGHT */}
                                                <View style={styles.NameWtBox}>
                                                    <View style={styles.weightBox}>
                                                        <>
                                                            <Text style={styles.weightText} wrap={false}>
                                                                Gr Wt. {formatNoRound(gross)}g, Nt Wt. {formatNoRound(net)}g
                                                            </Text>
                                                            {hasValidPpRows(item) && (
                                                                <Text style={styles.weightText}>
                                                                    P -{" "}
                                                                    {item.ppRows
                                                                        .filter((elm) => elm.count > 0 && elm.weight > 0)
                                                                        .map((ppElm, idx, arr) => (
                                                                            <React.Fragment key={idx}>
                                                                                {Number(ppElm.count) % 1 !== 0 ? (formatNoRound(ppElm.count) + " x " + ppElm.weight) : (formatNoRound(ppElm.weight) + " x " + ppElm.count)}
                                                                                {idx !== arr.length - 1 ? ", " : ""}
                                                                            </React.Fragment>
                                                                        ))}
                                                                </Text>
                                                            )}

                                                        </>
                                                    </View>
                                                </View>

                                                {/* RATE */}
                                                <View style={styles.rateBox}>
                                                    <Text>
                                                        RATE
                                                    </Text>
                                                    <Text style={styles.rateSize}>
                                                        {'@ ' + (
                                                            item.rateGm > 0
                                                                ? `${formatNoRound(item.rateGm)}/g`
                                                                : item.rateKg > 0
                                                                    ? `${formatNoRound(item.rateKg)}/kg`
                                                                    : `${formatIndianAmount((item.ratePer / 100) * silverRate)}/kg`
                                                        )}
                                                    </Text>
                                                    {/* <Text style={styles.rateSize}>
                                                        {'@ ' + (item.rateGm
                                                            ? (item.rateGm > 0 ? `${formatNoRound(item.rateGm)}/g` : `${formatNoRound(item.rateKg)}/kg`)
                                                            : `${formatIndianAmount((item.ratePer / 100) * silverRate)}/kg`)}
                                                    </Text> */}
                                                </View>

                                                {/* AMOUNT */}
                                                <View style={styles.amountBox}>
                                                    <Text style={styles.amountText}>
                                                        {rupee}
                                                        {formatIndianAmount(calculateAmount(item, silverRate))}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* {idx != items.length - 1 && isPExists && <View style={styles.itemDivider} />} */}

                                            <View style={styles.itemDivider} />
                                        </View>
                                    );
                                })}

                            {isSExists && isPExists &&
                                <>
                                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <View>
                                            <Text style={styles.grTotalText}>
                                                GR Wt = {formatNoRound(totalIssItemsGross)} g
                                            </Text>
                                        </View>
                                    </View>
                                    {!isPExists ? <View style={{ width: "100%" }}>
                                        <View style={styles.itemDivider} />
                                    </View> :
                                        <View style={{ marginTop: 6 }}></View>
                                    }
                                </>
                            }

                            {/* {isPExists && <View style={styles.sectionHeader2}> */}
                            {isPExists && <View style={isSExists ? styles.sectionHeader2 : styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>PURCHASE</Text>
                                <View style={styles.sectionDivider} />
                            </View>}

                            {isPExists && items
                                .filter((item) => item.itemType != "S")
                                .map((item, idx) => {
                                    if (!item.itemName?.trim()) return null;
                                    // console.log(item);
                                    const gross = Number(item.weight || 0);
                                    const net = calculateNetWeight(gross, item.ppRows);

                                    return (
                                        <View key={idx} style={styles.itemBlock}>
                                            <Text style={styles.itemName}>{stringFLCMaker(item.itemName)}</Text>
                                            <View style={styles.itemRow}>
                                                {/* WEIGHT */}
                                                <View style={styles.NameWtBox}>
                                                    <View style={styles.weightBox}>
                                                        <>
                                                            <Text style={styles.weightText} wrap={false}>
                                                                Gr Wt. {formatNoRound(gross)}g, Nt Wt. {formatNoRound(net)}g
                                                            </Text>
                                                            {hasValidPpRows(item) && (
                                                                <Text style={styles.weightText}>
                                                                    P -{" "}
                                                                    {item.ppRows
                                                                        .filter((elm) => elm.count > 0 && elm.weight > 0)
                                                                        .map((ppElm, idx, arr) => (
                                                                            <React.Fragment key={idx}>
                                                                                {Number(ppElm.count) % 1 !== 0 ? (formatNoRound(ppElm.count) + " x " + ppElm.weight) : (formatNoRound(ppElm.weight) + " x " + ppElm.count)}
                                                                                {idx !== arr.length - 1 ? ", " : ""}
                                                                            </React.Fragment>
                                                                        ))}
                                                                </Text>
                                                            )}

                                                        </>
                                                    </View>
                                                </View>

                                                {/* RATE */}
                                                <View style={styles.rateBox}>
                                                    <Text>
                                                        RATE
                                                    </Text>
                                                    <Text style={styles.rateSize}>
                                                        {'@ ' + (
                                                            item.rateGm > 0
                                                                ? `${formatNoRound(item.rateGm)}/g`
                                                                : item.rateKg > 0
                                                                    ? `${formatNoRound(item.rateKg)}/kg`
                                                                    : `${formatIndianAmount((item.ratePer / 100) * silverRate)}/kg`
                                                        )}
                                                    </Text>
                                                    {/* <Text style={styles.rateSize}>
                                                        {'@ ' + (item.rateGm
                                                            ? (item.rateGm > 0 ? `${formatNoRound(item.rateGm)}/g` : `${formatNoRound(item.rateKg)}/kg`)
                                                            : `${formatIndianAmount((item.ratePer / 100) * silverRate)}/kg`)}
                                                    </Text> */}
                                                </View>

                                                {/* AMOUNT */}
                                                <View style={styles.amountBox}>
                                                    <Text style={styles.amountText}>
                                                        {rupee}
                                                        {formatIndianAmount(calculateAmount(item, silverRate))}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View style={styles.itemDivider} />
                                        </View>
                                    );
                                })}

                            {isPExists && isSExists &&
                                <>
                                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <View>
                                            <Text style={styles.grTotalText}>
                                                GR Wt = {formatNoRound(totalRcItemsGross)} g
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={{ width: "100%" }}>
                                        <View style={styles.itemDivider} />
                                    </View>
                                </>
                            }

                            {/* TOTALS */}
                            {/* <View style={styles.totalsBox}>
                                
                                <Text style={styles.totalText}>
                                    Net: {formatNoRound(totalI - totalRCND)} g
                                </Text>
                                <Text style={styles.netAmount}>
                                    Net Amount: {rupee}
                                    {formatIndianAmount(totalAmount())}
                                </Text>
                            </View> */}
                            <View style={styles.totalsBox}>
                                {/* LEFT CORNER: Weights */}
                                <View style={styles.totalsLeft}>
                                    <Text style={styles.totalText}>
                                        Total Gr. Wt: {formatNoRound(totalI - totalRCND)} g
                                    </Text>
                                    <Text style={styles.totalText}>
                                        {/* Replace totalIssItemsNetWeight with your actual net weight calculation variable if different */}
                                        Total Net Wt: {formatNoRound(totalIssItemsNetWeight-totalRcItemsNetWeight)} g
                                    </Text>
                                </View>

                                {/* RIGHT CORNER: Amount */}
                                <View style={styles.totalsRight}>
                                    <Text style={styles.netAmount}>
                                        Net Amount: {rupee}{formatIndianAmount(totalAmount())}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.footer}>
                                <Text style={styles.footerText}>
                                    Thank you for your business
                                </Text>

                                {/* <Text style={styles.footerText}>
                                    Follow us on Instagram @kamaljewellersagra
                                </Text> */}

                                {/* <Text style={styles.footerSub}>
                                    This is a computer-generated invoice.
                                </Text> */}
                            </View>


                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );
};
