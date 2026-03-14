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

const basicStyles = {
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
        overflow: "hidden" as const,
        position: "relative" as const,
    },
    bgTop: {
        position: "absolute" as const,
        top: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: "#0284c7",
    },
    bgBottom: {
        position: "absolute" as const,
        bottom: 0,
        left: 0,
        right: 0,
        height: 135,
        backgroundColor: "#f0f9ff",
    },
    stripe: {
        position: "absolute" as const,
        top: 75,
        left: 0,
        right: 0,
        height: 10,
        backgroundColor: "#0ea5e9",
    },
    content: {
        position: "relative" as const,
        padding: 20,
        height: "100%",
    },
    headerRow: {
        flexDirection: "row" as const,
        justifyContent: "space-between" as const,
        alignItems: "flex-start" as const,
        marginBottom: 8,
    },
    clubTitle: {
        fontSize: 13,
        fontWeight: 700,
        color: "#ffffff",
        letterSpacing: 0.5,
    },
    logo: {
        width: 30,
        height: 30,
        marginRight: 8,
    },
    clubSub: {
        fontSize: 6,
        color: "#bae6fd",
        letterSpacing: 2,
        textTransform: "uppercase" as const,
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
        textTransform: "uppercase" as const,
    },
    bodyRow: {
        flexDirection: "row" as const,
        marginTop: 22,
        gap: 15,
    },
    photoBox: {
        width: 65,
        height: 75,
        borderRadius: 6,
        backgroundColor: "#e0f2fe",
        justifyContent: "center" as const,
        alignItems: "center" as const,
        borderWidth: 2,
        borderColor: "#0284c7",
        borderStyle: "solid" as const,
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
        objectFit: "cover" as const,
    },
    infoBlock: {
        flex: 1,
        justifyContent: "center" as const,
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
        flexDirection: "row" as const,
        marginBottom: 3,
    },
    detailLabel: {
        fontSize: 7,
        color: "#94a3b8",
        width: 55,
        textTransform: "uppercase" as const,
        letterSpacing: 0.5,
    },
    detailValue: {
        fontSize: 8,
        color: "#334155",
        fontWeight: 400,
    },
    footerBar: {
        position: "absolute" as const,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#0284c7",
        paddingHorizontal: 20,
        paddingVertical: 6,
        flexDirection: "row" as const,
        justifyContent: "space-between" as const,
    },
    footerText: {
        fontSize: 6,
        color: "#bae6fd",
        letterSpacing: 0.5,
    },
}

// ─── GOLD Card Styles ──────────────────────────────────────────────

const goldStyles = {
    ...basicStyles,
    bgTop: {
        ...basicStyles.bgTop,
        backgroundColor: "#b45309",
    },
    bgBottom: {
        ...basicStyles.bgBottom,
        backgroundColor: "#fffbeb",
    },
    stripe: {
        ...basicStyles.stripe,
        backgroundColor: "#f59e0b",
    },
    clubSub: {
        ...basicStyles.clubSub,
        color: "#fde68a",
    },
    tierBadge: {
        ...basicStyles.tierBadge,
        backgroundColor: "#fef3c7",
        borderWidth: 1,
        borderColor: "#f59e0b",
        borderStyle: "solid" as const,
    },
    tierText: {
        ...basicStyles.tierText,
        color: "#92400e",
    },
    photoBox: {
        ...basicStyles.photoBox,
        backgroundColor: "#fef3c7",
        borderColor: "#b45309",
    },
    photoInitial: {
        ...basicStyles.photoInitial,
        color: "#b45309",
    },
    memberCode: {
        ...basicStyles.memberCode,
        color: "#b45309",
    },
    footerBar: {
        ...basicStyles.footerBar,
        backgroundColor: "#b45309",
    },
    footerText: {
        ...basicStyles.footerText,
        color: "#fde68a",
    },
}

// ─── SILVER Card Styles ─────────────────────────────────────────────
const silverStyles = {
    ...basicStyles,
    bgTop: { ...basicStyles.bgTop, backgroundColor: "#64748b" },
    bgBottom: { ...basicStyles.bgBottom, backgroundColor: "#f8fafc" },
    stripe: { ...basicStyles.stripe, backgroundColor: "#94a3b8" },
    tierText: { ...basicStyles.tierText, color: "#475569" },
    memberCode: { ...basicStyles.memberCode, color: "#475569" },
    photoBox: { ...basicStyles.photoBox, borderColor: "#64748b" },
    photoInitial: { ...basicStyles.photoInitial, color: "#64748b" },
    footerBar: { ...basicStyles.footerBar, backgroundColor: "#64748b" },
}

// ─── PLATINUM Card Styles ───────────────────────────────────────────
const platinumStyles = {
    ...basicStyles,
    bgTop: { ...basicStyles.bgTop, backgroundColor: "#0f172a" },
    bgBottom: { ...basicStyles.bgBottom, backgroundColor: "#f1f5f9" },
    stripe: { ...basicStyles.stripe, backgroundColor: "#334155" },
    tierText: { ...basicStyles.tierText, color: "#1e293b" },
    memberCode: { ...basicStyles.memberCode, color: "#1e293b" },
    photoBox: { ...basicStyles.photoBox, borderColor: "#0f172a" },
    photoInitial: { ...basicStyles.photoInitial, color: "#0f172a" },
    footerBar: { ...basicStyles.footerBar, backgroundColor: "#0f172a" },
}

const styles = {
    BASIC: StyleSheet.create(basicStyles),
    GOLD: StyleSheet.create(goldStyles),
    SILVER: StyleSheet.create(silverStyles),
    PLATINUM: StyleSheet.create(platinumStyles),
}

// ─── Props ──────────────────────────────────────────────

interface MembershipCardProps {
    logoUrl?: string
    name: string
    membershipCode: string
    bloodGroup: string
    mobile: string
    photoUrl?: string | null
    membershipStatus: string
    joinDate: string
}

// ─── Card Component ──────────────────────────────────────

function PDFCardContent({
    logoUrl,
    name,
    membershipCode,
    bloodGroup,
    mobile,
    photoUrl,
    membershipStatus,
    joinDate,
}: MembershipCardProps) {
    const s = 
        membershipStatus === "PLATINUM" ? styles.PLATINUM :
        membershipStatus === "GOLD" ? styles.GOLD :
        membershipStatus === "SILVER" ? styles.SILVER : styles.BASIC
    
    const tierLabel = `${membershipStatus} MEMBER`

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
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        {logoUrl && <Image src={logoUrl} style={s.logo} />}
                        <View>
                            <Text style={s.clubTitle}>TOWN TEAM ATHANIKKAL</Text>
                            <Text style={s.clubSub}>Sports Club</Text>
                        </View>
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
                <Text style={s.footerText}>TOWN TEAM ATHANIKKAL</Text>
                <Text style={s.footerText}>Athanikkal, Kerala</Text>
            </View>
        </View>
    )
}

// ─── Full PDF Document ──────────────────────────────────

export function MembershipCardPDF(props: MembershipCardProps) {
    const s = 
        props.membershipStatus === "PLATINUM" ? styles.PLATINUM :
        props.membershipStatus === "GOLD" ? styles.GOLD :
        props.membershipStatus === "SILVER" ? styles.SILVER : styles.BASIC

    return (
        <Document>
            <Page size={[360, 235]} style={s.page}>
                <PDFCardContent {...props} />
            </Page>
        </Document>
    )
}
