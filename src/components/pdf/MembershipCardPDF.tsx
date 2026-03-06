"use client"

import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
    Image,
} from "@react-pdf/renderer"

Font.register({
    family: "Roboto",
    fonts: [
        { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf", fontWeight: 300 },
        { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf", fontWeight: 400 },
        { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf", fontWeight: 700 },
    ],
})

// ─── BASIC Card Styles ──────────────────────────────────────────────

const basicStyles = StyleSheet.create({
    page: {
        fontFamily: "Roboto",
        backgroundColor: "#ffffff",
        padding: 0,
    },
    card: {
        width: 340,
        height: 215,
        margin: "auto",
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
    },
    bgTop: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: "#0284c7",
    },
    bgBottom: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 135,
        backgroundColor: "#f0f9ff",
    },
    stripe: {
        position: "absolute",
        top: 75,
        left: 0,
        right: 0,
        height: 10,
        backgroundColor: "#0ea5e9",
    },
    content: {
        position: "relative",
        padding: 20,
        height: "100%",
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    clubTitle: {
        fontSize: 13,
        fontWeight: 700,
        color: "#ffffff",
        letterSpacing: 0.5,
    },
    clubSub: {
        fontSize: 6,
        color: "#bae6fd",
        letterSpacing: 2,
        textTransform: "uppercase",
        marginTop: 2,
    },
    tierBadge: {
        backgroundColor: "#ffffff",
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    tierText: {
        fontSize: 7,
        fontWeight: 700,
        color: "#0284c7",
        letterSpacing: 1.5,
        textTransform: "uppercase",
    },
    bodyRow: {
        flexDirection: "row",
        marginTop: 22,
        gap: 15,
    },
    photoBox: {
        width: 65,
        height: 75,
        borderRadius: 6,
        backgroundColor: "#e0f2fe",
        justifyContent: "center",
        alignItems: "center",
        border: "2px solid #0284c7",
    },
    photoInitial: {
        fontSize: 28,
        fontWeight: 700,
        color: "#0284c7",
    },
    photo: {
        width: 65,
        height: 75,
        borderRadius: 6,
        objectFit: "cover",
    },
    infoBlock: {
        flex: 1,
        justifyContent: "center",
    },
    memberName: {
        fontSize: 14,
        fontWeight: 700,
        color: "#0f172a",
        marginBottom: 4,
    },
    memberCode: {
        fontSize: 9,
        fontWeight: 700,
        color: "#0284c7",
        marginBottom: 8,
        letterSpacing: 1,
    },
    detailRow: {
        flexDirection: "row",
        marginBottom: 3,
    },
    detailLabel: {
        fontSize: 7,
        color: "#94a3b8",
        width: 55,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    detailValue: {
        fontSize: 8,
        color: "#334155",
        fontWeight: 400,
    },
    footerBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#0284c7",
        paddingHorizontal: 20,
        paddingVertical: 6,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    footerText: {
        fontSize: 6,
        color: "#bae6fd",
        letterSpacing: 0.5,
    },
})

// ─── GOLD Card Styles ──────────────────────────────────────────────

const goldStyles = StyleSheet.create({
    page: {
        fontFamily: "Roboto",
        backgroundColor: "#ffffff",
        padding: 0,
    },
    card: {
        width: 340,
        height: 215,
        margin: "auto",
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
    },
    bgTop: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: "#b45309",
    },
    bgBottom: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 135,
        backgroundColor: "#fffbeb",
    },
    stripe: {
        position: "absolute",
        top: 75,
        left: 0,
        right: 0,
        height: 10,
        backgroundColor: "#f59e0b",
    },
    content: {
        position: "relative",
        padding: 20,
        height: "100%",
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    clubTitle: {
        fontSize: 13,
        fontWeight: 700,
        color: "#ffffff",
        letterSpacing: 0.5,
    },
    clubSub: {
        fontSize: 6,
        color: "#fde68a",
        letterSpacing: 2,
        textTransform: "uppercase",
        marginTop: 2,
    },
    tierBadge: {
        backgroundColor: "#fef3c7",
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        border: "1px solid #f59e0b",
    },
    tierText: {
        fontSize: 7,
        fontWeight: 700,
        color: "#92400e",
        letterSpacing: 1.5,
        textTransform: "uppercase",
    },
    bodyRow: {
        flexDirection: "row",
        marginTop: 22,
        gap: 15,
    },
    photoBox: {
        width: 65,
        height: 75,
        borderRadius: 6,
        backgroundColor: "#fef3c7",
        justifyContent: "center",
        alignItems: "center",
        border: "2px solid #b45309",
    },
    photoInitial: {
        fontSize: 28,
        fontWeight: 700,
        color: "#b45309",
    },
    photo: {
        width: 65,
        height: 75,
        borderRadius: 6,
        objectFit: "cover",
    },
    infoBlock: {
        flex: 1,
        justifyContent: "center",
    },
    memberName: {
        fontSize: 14,
        fontWeight: 700,
        color: "#0f172a",
        marginBottom: 4,
    },
    memberCode: {
        fontSize: 9,
        fontWeight: 700,
        color: "#b45309",
        marginBottom: 8,
        letterSpacing: 1,
    },
    detailRow: {
        flexDirection: "row",
        marginBottom: 3,
    },
    detailLabel: {
        fontSize: 7,
        color: "#94a3b8",
        width: 55,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    detailValue: {
        fontSize: 8,
        color: "#334155",
        fontWeight: 400,
    },
    footerBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#b45309",
        paddingHorizontal: 20,
        paddingVertical: 6,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    footerText: {
        fontSize: 6,
        color: "#fde68a",
        letterSpacing: 0.5,
    },
})

// ─── Props ──────────────────────────────────────────────

interface MembershipCardProps {
    name: string
    membershipCode: string
    bloodGroup: string
    mobile: string
    photoUrl?: string | null
    membershipStatus: "BASIC" | "GOLD"
    joinDate: string
}

// ─── Card Component ──────────────────────────────────────

function PDFCardContent({
    name,
    membershipCode,
    bloodGroup,
    mobile,
    photoUrl,
    membershipStatus,
    joinDate,
}: MembershipCardProps) {
    const s = membershipStatus === "GOLD" ? goldStyles : basicStyles
    const tierLabel = membershipStatus === "GOLD" ? "GOLD MEMBER" : "BASIC MEMBER"

    const formattedJoinDate = new Date(joinDate).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
    })

    const displayBloodGroup = bloodGroup.replace("_POS", "+").replace("_NEG", "-")

    return (
        <View style={s.card}>
            <View style={s.bgTop} />
            <View style={s.bgBottom} />
            <View style={s.stripe} />
            <View style={s.content}>
                {/* Header */}
                <View style={s.headerRow}>
                    <View>
                        <Text style={s.clubTitle}>Town Team Athanikkal</Text>
                        <Text style={s.clubSub}>Football Club</Text>
                    </View>
                    <View style={s.tierBadge}>
                        <Text style={s.tierText}>{tierLabel}</Text>
                    </View>
                </View>

                {/* Body */}
                <View style={s.bodyRow}>
                    {photoUrl ? (
                        <Image src={photoUrl} style={s.photo} />
                    ) : (
                        <View style={s.photoBox}>
                            <Text style={s.photoInitial}>{name.charAt(0).toUpperCase()}</Text>
                        </View>
                    )}
                    <View style={s.infoBlock}>
                        <Text style={s.memberName}>{name}</Text>
                        <Text style={s.memberCode}>{membershipCode}</Text>
                        <View style={s.detailRow}>
                            <Text style={s.detailLabel}>Blood</Text>
                            <Text style={s.detailValue}>{displayBloodGroup}</Text>
                        </View>
                        <View style={s.detailRow}>
                            <Text style={s.detailLabel}>Mobile</Text>
                            <Text style={s.detailValue}>{mobile}</Text>
                        </View>
                        <View style={s.detailRow}>
                            <Text style={s.detailLabel}>Since</Text>
                            <Text style={s.detailValue}>{formattedJoinDate}</Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={s.footerBar}>
                <Text style={s.footerText}>Town Team Athanikkal</Text>
                <Text style={s.footerText}>Athanikkal, Kerala</Text>
            </View>
        </View>
    )
}

// ─── Full PDF Document ──────────────────────────────────

export function MembershipCardPDF(props: MembershipCardProps) {
    const s = props.membershipStatus === "GOLD" ? goldStyles : basicStyles

    return (
        <Document>
            <Page size={[360, 235]} style={s.page}>
                <PDFCardContent {...props} />
            </Page>
        </Document>
    )
}
