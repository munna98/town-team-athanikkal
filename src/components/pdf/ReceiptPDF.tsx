import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
    Svg,
    Path,
    Image,
} from "@react-pdf/renderer"
import { numberToWords } from "@/lib/utils"

Font.register({
    family: "Roboto",
    fonts: [
        { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf", fontWeight: 300 },
        { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf", fontWeight: 400 },
        { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf", fontWeight: 700 },
    ],
})

const styles = StyleSheet.create({
    page: {
        fontFamily: "Times-Roman",
        fontSize: 12,
        padding: 40,
        backgroundColor: "#ffffff",
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 5,
        position: "relative",
    },
    headerTextContainer: {
        alignItems: "center",
    },
    clubName: {
        fontFamily: "Times-Bold",
        fontSize: 26,
        letterSpacing: 1,
        marginBottom: 4,
    },
    address: {
        fontFamily: "Times-Bold",
        fontSize: 11,
    },
    dividerLine: {
        borderBottomWidth: 1.5,
        borderBottomColor: "#000",
        marginVertical: 5,
    },
    titleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginTop: 0,
        marginBottom: 25,
    },
    voucherTitleWrapper: {
        backgroundColor: "#000",
        paddingVertical: 4,
        paddingHorizontal: 12,
        marginTop: -1,
    },
    voucherTitle: {
        color: "#fff",
        fontFamily: "Times-Bold",
        fontSize: 12,
    },
    metaText: {
        fontFamily: "Times-Italic",
        fontSize: 16,
    },
    metaValueText: {
        fontFamily: "Times-Roman",
        fontSize: 14,
    },
    inputLineRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        marginBottom: 20,
    },
    collectedByRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        marginBottom: 40, // Increased space
    },
    italicText: {
        fontFamily: "Times-Italic",
        fontSize: 16,
        marginRight: 5,
    },
    valueContainer: {
        flex: 1,
        borderBottomWidth: 1.5,
        borderBottomStyle: "dotted",
        borderBottomColor: "#000",
        paddingBottom: 2,
        paddingLeft: 5,
        justifyContent: "flex-end",
        minHeight: 20,
    },
    valueText: {
        fontFamily: "Times-Roman",
        fontSize: 14,
    },
    bottomRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginTop: 10,
    },
    amountBox: {
        flexDirection: "row",
        borderWidth: 1.5,
        borderColor: "#000",
        width: 150,
        height: 35,
        alignItems: "center",
    },
    currencySymbolBox: {
        width: 35,
        height: "100%",
        borderRightWidth: 1.5,
        borderRightColor: "#000",
        justifyContent: "center",
        alignItems: "center",
    },
    currencySymbol: {
        fontFamily: "Roboto",
        fontSize: 18,
        fontWeight: 400,
    },
    amountValueBox: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    amountValue: {
        fontFamily: "Times-Bold",
        fontSize: 16,
    },
    signatureContainer: {
        alignItems: "center",
        paddingRight: 20,
    },
    signatureLabel: {
        fontFamily: "Times-Bold",
        fontSize: 12,
    },
    watermarkContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        zIndex: -1,
    },
    watermarkImage: {
        width: 250,
        height: 250,
        opacity: 0.15,
    }
})

interface ReceiptPDFProps {
    logoUrl?: string
    referenceNo: string
    date: string
    memberName?: string
    memberCode?: string
    narration: string
    amount: number
    cashOrBank: string
    collectedBy: string
    creditAccount: string
}

export function ReceiptPDF({
    logoUrl,
    referenceNo,
    date,
    memberName,
    memberCode,
    narration,
    amount,
    cashOrBank,
    collectedBy,
    creditAccount,
}: ReceiptPDFProps) {
    const formattedDate = new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    })

    const memberDisplayName = memberName ? `${memberName} ${memberCode ? `(${memberCode})` : ""}` : narration

    const sumWords = numberToWords(amount)

    return (
        <Document>
            <Page size="B5" orientation="landscape" style={styles.page}>
                <View style={styles.watermarkContainer}>
                    {/* Make sure the image path resolves properly in this environment */}
                    <Image src={logoUrl || "/logo.png"} style={styles.watermarkImage} />
                </View>

                <View style={styles.headerRow}>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.clubName}>TOWN TEAM SPORTS CLUB</Text>
                        <Text style={styles.address}>ATHANIKKAL, VALLUVAMBRAM PO, PIN 673642</Text>
                    </View>
                </View>

                <View style={styles.dividerLine} />

                <View style={styles.titleRow}>
                    <View style={{ flex: 1, alignItems: "flex-start" }}>
                        <Text style={styles.metaText}>
                            No. <Text style={styles.metaValueText}>{referenceNo}</Text>
                        </Text>
                    </View>
                    <View style={styles.voucherTitleWrapper}>
                        <Text style={styles.voucherTitle}>RECEIPT VOUCHER</Text>
                    </View>
                    <View style={{ flex: 1, alignItems: "flex-end" }}>
                        <Text style={styles.metaText}>
                            Date: <Text style={styles.metaValueText}>{formattedDate}</Text>
                        </Text>
                    </View>
                </View>

                <View style={[styles.inputLineRow, { marginTop: 10 }]}>
                    <Text style={styles.italicText}>Received From Mr./M/s </Text>
                    <View style={styles.valueContainer}>
                        <Text style={styles.valueText}>{memberDisplayName}</Text>
                    </View>
                </View>

                <View style={styles.inputLineRow}>
                    <Text style={styles.italicText}>the sum of Rupees </Text>
                    <View style={styles.valueContainer}>
                        <Text style={styles.valueText}>{sumWords}</Text>
                    </View>
                </View>

                <View style={styles.collectedByRow}>
                    <Text style={styles.italicText}>collected by </Text>
                    <View style={[styles.valueContainer, { flex: 1, marginRight: 10 }]}>
                        <Text style={styles.valueText}>{collectedBy}</Text>
                    </View>
                    <Text style={styles.italicText}> Balance Amount </Text>
                    <View style={[styles.valueContainer, { flex: 0.5 }]}>
                        <Text style={styles.valueText}></Text>
                    </View>
                </View>

                <View style={[styles.bottomRow, { marginBottom: 30 }]}>
                    <View style={styles.amountBox}>
                        <View style={styles.currencySymbolBox}>
                            <Svg viewBox="0 0 320 512" width="14" height="14">
                                <Path d="M308 96c6.627 0 12-5.373 12-12V44c0-6.627-5.373-12-12-12H12C5.373 32 0 37.373 0 44v44c0 6.627 5.373 12 12 12h85.28c27.308 0 48.261 9.958 60.97 27.252H12c-6.627 0-12 5.373-12 12v40c0 6.627 5.373 12 12 12h158.757c-6.217 36.086-32.961 58.632-74.757 58.632H12c-6.627 0-12 5.373-12 12v53.012c0 3.349 1.4 6.546 3.861 8.818l165.052 152.356a12.001 12.001 0 0 0 8.139 3.182h82.562c10.924 0 16.166-13.408 8.139-20.818L116.871 319.906c76.499-2.34 131.144-53.395 138.318-127.906H308c6.627 0 12-5.373 12-12v-40c0-6.627-5.373-12-12-12h-58.69c-3.486-11.541-8.28-22.246-14.252-32H308z" fill="#000" />
                            </Svg>
                        </View>
                        <View style={styles.amountValueBox}>
                            <Text style={styles.amountValue}>{amount.toLocaleString("en-IN")}</Text>
                        </View>
                    </View>

                    <View style={styles.signatureContainer}>
                        <Text style={styles.signatureLabel}>Received Signature</Text>
                    </View>
                </View>

                <View style={{ position: "absolute", bottom: 20, left: 40, right: 40, alignItems: "center" }}>
                    <Text style={{ fontFamily: "Times-Italic", fontSize: 10, color: "#666" }}>
                        This is a computer-generated document. No signature is required.
                    </Text>
                </View>
            </Page>
        </Document>
    )
}
