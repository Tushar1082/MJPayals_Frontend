import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import {
    calculateItemAmount,
    calculateNetWeight,
    roundTo,
    roundToInt,
    customRound,
    calculateWholesaleGrandTotal
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
        maximumFractionDigits: 2,
    });
}

const calculateAmount = (item, silverRate) => {
    const { amount } = calculateItemAmount('W', {  // ✅ 'W' for wholesale
        grossWeight: item.weight,
        ppRows: item.ppRows,
        rateGm: item.rateGm,
        rateKg: item.rateKg,
        ratePer: item.ratePer,
        silverRate: silverRate,
        labourType: item.labourType,
        labourRate: item.labourRate,
        labourNumPieces: item.labourNumPieces
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
        // color:'#5478FF'
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

    sectionHeader: {
        marginTop: 8,
        marginBottom: 4,
    },

    sectionHeader2: {
        marginTop: 1,
        marginBottom: 4,
    },

    sectionTitle: {
        fontSize: 8.5,
        fontWeight: "600",
        letterSpacing: 0.5,
    },
    sectionDivider: {
        borderTopWidth: 0.4,
        marginBottom: 6,
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
        flexShrink: 0
    },

    rateBox: {
        fontSize: 8,
        flex: 1,
        // alignItems: "flex-end", // Changed from "center" to push numbers to the right
        justifyContent: "center",
        paddingRight: 4,
        alignItems: "center",
        // justifyContent: "center"
    },

    aRateBox: {
        fontSize: 8,
        flex: 1,
        gap: 1.5,
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "center"
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
        flex: 1
    },

    amountBox: {
        width: 42,
        alignItems: "flex-end",
        justifyContent: "center",
    },

    amountBox1: {
        width: 42,
        alignItems: "flex-end",
        justifyContent: "center",
    },

    amountText: {
        fontSize: 7,
        fontWeight: "500",
    },

    itemDivider: {
        borderTopWidth: 0.3,
        marginTop: 6,
        color: 'lightgrey'
    },

    fineRCVDBox: {
        alignItems: "flex-end",
    },

    totalsBox: {
        marginTop: 10,
        flexDirection: "row",            // Added to make it a row
        justifyContent: "space-between",
        alignItems: "flex-end",
    },

    totalsLeft: {
        flexDirection: "column",
        gap: 3,
    },

    totalsRight: {
        alignItems: "flex-end",
    },

    totalText: {
        fontSize: 8.5,
    },

    fineTotalText: {
        fontSize: 8.5,
        marginBottom: 0.5
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

    /* ================= NON TABULAR ITEM STYLE ================= */

    itemsWrapper: {
        // marginTop: 10,
    },

    itemTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },

    itemLeft: {
        flex: 3
    },

    itemLeft1: {
        // flex: 0
    },

    itemDetails: {
        fontSize: 7,
        color: "#444",
        lineHeight: 1.4,
    },

    itemRateBlock: {
        flex: 1,
        alignItems: "center",
    },

    rateLabel: {
        fontSize: 6.5,
        color: "#666",
        marginBottom: 2,
    },

    rateValue: {
        fontSize: 8,
        fontWeight: "500",
    },

    itemAmount: {
        flex: 1,
        alignItems: "flex-end",
    },

    /* TOTAL SECTION */

    summarySection: {
        marginTop: 14,
        alignItems: "flex-end",
    },

    summaryText: {
        fontSize: 8,
        marginBottom: 2,
    },

    netAmountText: {
        fontSize: 11,
        fontWeight: "700",
        marginTop: 4,
    },


});

export const WholeSalerBillPDFA = ({ items, silverRate, invoiceDate, isPExists, isSExists }) => {
    function totalLabour() {
        let totalSLAm = 0;
        let totalPLAm = 0;

        items.forEach((item) => {
            if (item.itemType === "S") {
                totalSLAm += item.labourAmount;
            } else if (item.itemType === "P") {
                totalPLAm += item.labourAmount;
            }
        });
        return roundToInt(totalSLAm - totalPLAm);
    }

    function totalAmount() {
        return calculateWholesaleGrandTotal(items, silverRate);
        // let totalAm = 0;

        // items.forEach((item) => {
        //     if (item.itemType === "S") {
        //         totalAm += calculateAmount(item, silverRate);
        //         // total += amount;   // customer buying
        //     } else if (item.itemType === "P") {
        //         // total -= amount;   // customer giving silver
        //         totalAm -= calculateAmount(item, silverRate);
        //     }
        //     // totalAm += calculateAmount(item, silverRate);
        // });

        // return totalAm;
    }

    // const netFine = items.reduce((sum, item) => {
    //     if (item.itemType == "R") {
    //         return sum;
    //     }
    //     const gross = Number(item.weight || 0);
    //     const net = calculateNetWeight(gross, item.ppRows);  // ✅ Use helper
    //     const fine = item.ratePer ? (net * (item.ratePer / 100)) : 0;
    //     return sum + fine;
    // }, 0);

    // const netRCND = items.reduce((sum, item) => {
    //     if (item.itemType == "I") {
    //         return sum;
    //     }
    //     return sum + item.weight;
    // }, 0);

    const netWeight = items.reduce((sum, item) => {
        return sum + item.weight;
    }, 0);

    // const totalIssItemsFine = items.reduce((sum, item) => {
    //     if (item.itemType == "R") {
    //         return sum;
    //     }
    //     return sum + item.weight;
    // }, 0);

    const totalIssItemsGross = items.reduce((sum, item) => {
        if (item.itemType == "P") return sum;

        return sum + Number(item.weight || 0);
    }, 0);

    const totalIssItemsFine = items.reduce((sum, item) => {
        if (item.itemType == "P") return sum;
        const net = calculateNetWeight(Number(item.weight || 0), item.ppRows);
        const fine = item.ratePer > 0 ? net * (item.ratePer / 100) : 0;
        return sum + fine;
    }, 0);

    const totalRcItemsGross = items.reduce((sum, item) => {
        if (item.itemType == "S") return sum;

        return sum + Number(item.weight || 0);
    }, 0);

    const totalRcItemsFine = items.reduce((sum, item) => {
        if (item.itemType == "S") return sum;
        const net = calculateNetWeight(Number(item.weight || 0), item.ppRows);
        const fine = item.ratePer > 0 ? net * (item.ratePer / 100) : net;
        return sum + fine;
    }, 0);

    const totalItemsRC = items.reduce((sum, item) => {
        if (item.itemType == "S") return sum;
        return sum + item.weight;
    }, 0);

    // Calculate Net Weights for the summary
    const totalIssItemsNet = items.reduce((sum, item) => {
        if (item.itemType == "P") return sum;
        return sum + calculateNetWeight(Number(item.weight || 0), item.ppRows);
    }, 0);

    const totalRcItemsNet = items.reduce((sum, item) => {
        if (item.itemType == "S") return sum;
        return sum + calculateNetWeight(Number(item.weight || 0), item.ppRows);
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

                            {/* <View style={styles.divider} /> */}

                            <View style={styles.itemsWrapper}>
                                {isSExists && items
                                    .filter((item) => item.itemType != "P")
                                    .map((item, idx) => {
                                        if (!item.itemName?.trim()) return null;

                                        const gross = Number(item.weight || 0);
                                        const net = calculateNetWeight(gross, item.ppRows);  // ✅ Use helper
                                        // const totalPP = getTotalPPWeight(item.ppRows);
                                        // const net = gross - totalPP;
                                        // const amount = calculateAmount(item, silverRate);

                                        return (
                                            <View key={idx} style={styles.itemBlock}>
                                                <Text style={styles.itemName}>
                                                    {stringFLCMaker(item.itemName)}
                                                </Text>
                                                <View style={styles.itemTopRow}>

                                                    {/* LEFT SIDE */}
                                                    <View style={styles.itemLeft}>

                                                        <Text style={styles.weightText} wrap={false}>
                                                            {`Gr Wt. ${formatNoRound(gross)}g, Nt Wt. ${formatNoRound(net)}g`}
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

                                                    </View>

                                                    {/* CENTER RATE */}
                                                    {/* <View style={styles.rateBox}>
                                                    <Text>RATE</Text>
                                                    <Text>
                                                        {'@ ' + (item.rateGm
                                                            ? `${formatNoRound(item.rateGm)}/g`
                                                            : `T${item.ratePer}`)}
                                                    </Text>
                                                   </View> */}
                                                    <View style={styles.rateBox}>
                                                        <Text>RATE</Text>

                                                        {item.rateGm > 0 ? (
                                                            <Text>
                                                                @ {formatNoRound(item.rateGm)}/g
                                                            </Text>
                                                        ) : item.rateKg > 0 ? (
                                                            <Text>
                                                                @ {formatNoRound(item.rateKg)}/kg
                                                            </Text>
                                                        ) : item.ratePer > 0 ? (
                                                            <Text>
                                                                T {formatNoRound(item.ratePer)}
                                                            </Text>
                                                        ) : (
                                                            <Text>-</Text>
                                                        )}
                                                    </View>

                                                    {/* CENTER Labour */}
                                                    {/* {item?.ratePer > 0 &&  */}
                                                    <View style={styles.rateBox}>
                                                        <Text>FINE</Text>
                                                        <Text>
                                                            {item.ratePer > 0 ? formatNoRound(net * (item.ratePer / 100)) + "g" : '-'}
                                                        </Text>
                                                    </View>
                                                    {/* } */}

                                                    {/* CENTER Labour */}
                                                    {/* {item?.ratePer > 0 &&  */}
                                                    <View style={styles.rateBox}>
                                                        <Text>LBR. RATE</Text>
                                                        <Text>
                                                            {formatIndianAmount(item.labourRate)}{item.labourType == 'G' && '/g'}{item.labourType == 'K' && '/kg'}
                                                        </Text>
                                                    </View>
                                                    {/* } */}

                                                    {/* {item?.ratePer > 0 &&  */}
                                                    <View style={styles.rateBox}>
                                                        <Text>LBR. AMT.</Text>
                                                        <Text>
                                                            {formatIndianAmount(item.labourAmount)}{item.labourNumPieces > 0 && item.labourType == 'P' && "(" + item.labourNumPieces + " pcs.)"}
                                                        </Text>
                                                    </View>
                                                    {/* } */}

                                                    {/* RIGHT AMOUNT */}
                                                    {/* <View style={item?.ratePer > 0 ? styles.amountBox : styles.amountBox1}>
                                                    <Text style={styles.amountText}>
                                                        {rupee}
                                                        {formatIndianAmount(amount)}
                                                    </Text>
                                                  </View> */}

                                                </View>

                                                <View style={styles.itemDivider} />
                                            </View>
                                        );
                                    })}

                                {isSExists &&
                                    <>
                                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <View>
                                                <Text style={styles.fineTotalText}>
                                                    GR Wt = {formatNoRound(totalIssItemsGross)} g
                                                </Text>
                                            </View>
                                            <View style={styles.fineRCVDBox}>
                                                <Text style={styles.fineTotalText}>
                                                    Total Fine: {formatNoRound(customRound(totalIssItemsFine))} g
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

                                        const gross = Number(item.weight || 0);
                                        const net = calculateNetWeight(gross, item.ppRows);  // ✅ Use helper
                                        // const totalPP = getTotalPPWeight(item.ppRows);
                                        // const net = gross - totalPP;
                                        // const amount = calculateAmount(item, silverRate);

                                        return (
                                            <View key={idx} style={styles.itemBlock}>
                                                <Text style={styles.itemName}>
                                                    {stringFLCMaker(item.itemName)}
                                                </Text>
                                                <View style={styles.itemTopRow}>

                                                    {/* LEFT SIDE */}
                                                    <View style={styles.itemLeft}>

                                                        <Text style={styles.weightText} wrap={false}>
                                                            {`Gr Wt. ${formatNoRound(gross)}g, Nt Wt. ${formatNoRound(net)}g`}
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

                                                    </View>

                                                    {/* CENTER RATE */}
                                                    {/* <View style={styles.rateBox}>
                                                    <Text>RATE</Text>
                                                    <Text>
                                                        {'@ ' + (item.rateGm
                                                            ? `${formatNoRound(item.rateGm)}/g`
                                                            : `T${item.ratePer}`)}
                                                    </Text>
                                                </View> */}
                                                    <View style={styles.rateBox}>
                                                        <Text>RATE</Text>

                                                        {item.rateGm > 0 ? (
                                                            <Text>
                                                                @ {formatNoRound(item.rateGm)}/g
                                                            </Text>
                                                        ) : item.rateKg > 0 ? (
                                                            <Text>
                                                                @ {formatNoRound(item.rateKg)}/kg
                                                            </Text>
                                                        ) : item.ratePer > 0 ? (
                                                            <Text>
                                                                T {formatNoRound(item.ratePer)}
                                                            </Text>
                                                        ) : (
                                                            <Text>-</Text>
                                                        )}
                                                    </View>

                                                    {/* CENTER Labour */}
                                                    {/* {item?.ratePer > 0 &&  */}
                                                    <View style={styles.rateBox}>
                                                        <Text>FINE</Text>
                                                        <Text>
                                                            {item.ratePer > 0 ? formatNoRound(net * (item.ratePer / 100)) + "g" : '-'}
                                                        </Text>
                                                    </View>
                                                    {/* } */}

                                                    {/* CENTER Labour */}
                                                    {/* {item?.ratePer > 0 &&  */}
                                                    <View style={styles.rateBox}>
                                                        <Text>LBR. RATE</Text>
                                                        <Text>
                                                            {formatIndianAmount(item.labourRate)}{item.labourType == 'G' && '/g'}{item.labourType == 'K' && '/kg'}
                                                        </Text>
                                                    </View>
                                                    {/* } */}

                                                    {/* {item?.ratePer > 0 &&  */}
                                                    <View style={styles.rateBox}>
                                                        <Text>LBR. AMT.</Text>
                                                        <Text>
                                                            {formatIndianAmount(item.labourAmount)}{item.labourNumPieces > 0 && item.labourType == 'P' && "(" + item.labourNumPieces + " pcs.)"}
                                                        </Text>
                                                    </View>
                                                    {/* } */}

                                                    {/* RIGHT AMOUNT */}
                                                    {/* <View style={item?.ratePer > 0 ? styles.amountBox : styles.amountBox1}>
                                                    <Text style={styles.amountText}>
                                                        {rupee}
                                                        {formatIndianAmount(amount)}
                                                    </Text>
                                                </View> */}

                                                </View>

                                                <View style={styles.itemDivider} />
                                            </View>
                                        );
                                    })}

                                {isPExists &&
                                    <>
                                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <View>
                                                <Text style={styles.fineTotalText}>
                                                    GR Wt = {formatNoRound(totalRcItemsGross)} g
                                                </Text>
                                            </View>
                                            <View style={styles.fineRCVDBox}>
                                                <Text style={styles.fineTotalText}>
                                                    Total Fine: {formatNoRound(customRound(totalRcItemsFine))} g
                                                </Text>
                                                {/* <Text style={styles.fineTotalText}>
                                        Total RCVD: {formatNoRound(totalItemsRC)} g
                                    </Text> */}

                                                {/* <View style={styles.itemDivider} /> */}
                                            </View>
                                        </View>
                                        <View style={{ width: "100%" }}>
                                            <View style={styles.itemDivider} />
                                        </View>
                                    </>
                                }
                            </View>


                            {/* TOTALS */}
                            {/* <View style={styles.totalsBox}>
                                <Text style={styles.fineTotalText}>
                                    Net : {formatNoRound(totalIssItemsFine - totalRcItemsFine)} g
                                </Text>
                                
                                <Text style={styles.netAmount}>
                                    Net Amount: {rupee}
                                    {formatIndianAmount(totalAmount())}
                                </Text>
                            </View> */}
                            <View style={styles.totalsBox}>
                                {/* LEFT CORNER: Weights & Fine */}
                                <View style={styles.totalsLeft}>
                                    <Text style={styles.fineTotalText}>
                                        Total Gross Wt: {formatNoRound(formatNoRound(totalIssItemsGross) - formatNoRound(totalRcItemsGross))} g
                                    </Text>
                                    <Text style={styles.fineTotalText}>
                                        Total Net Wt: {formatNoRound(formatNoRound(totalIssItemsNet) - formatNoRound(totalRcItemsNet))} g
                                    </Text>
                                    <Text style={styles.fineTotalText}>
                                        Total Net Fine: {formatNoRound(
                                            customRound(
                                                formatNoRound(customRound(totalIssItemsFine)) - formatNoRound(customRound(totalRcItemsFine))
                                            )
                                        )} g
                                    </Text>
                                </View>

                                {/* RIGHT CORNER: Amount */}
                                <View style={styles.totalsRight}>
                                    <Text style={styles.netAmount}>
                                        Labour Amount: {rupee}{formatIndianAmount(totalLabour())}
                                    </Text>
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
