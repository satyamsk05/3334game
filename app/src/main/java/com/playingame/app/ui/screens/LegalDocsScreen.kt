package com.playingame.app.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.playingame.app.R
import com.playingame.app.ui.theme.RubikFont
import com.playingame.app.util.noRippleClickable

/**
 * In-app legal documents (Privacy Policy / Terms of Service / Refund Policy).
 * docType: "TERMS" | "PRIVACY" | "REFUND"
 *
 * Placeholders in [BRACKETS] must be filled with the operator's real legal
 * entity details before release — IT Rules 2021 and the DPDP Act 2023 require
 * a named grievance officer and publisher details.
 */
@Composable
fun LegalDocsScreen(
    docType: String,
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    BackHandler { onBackClick() }

    val title = when (docType) {
        "PRIVACY" -> "Privacy Policy"
        "REFUND" -> "Refund & Cancellation Policy"
        else -> "Terms of Service"
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF0A0C11))
            .padding(horizontal = 16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(top = 12.dp, bottom = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color(0xFF0F1015))
                    .border(1.dp, Color(0xFF1E2028), RoundedCornerShape(12.dp))
                    .noRippleClickable { onBackClick() },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.ic_arrow_back),
                    contentDescription = "Back",
                    modifier = Modifier.size(20.dp),
                    tint = Color.White
                )
            }

            Spacer(modifier = Modifier.width(14.dp))

            Column {
                Text(
                    text = title,
                    fontSize = 20.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = "Last updated: 11 October 2026",
                    fontSize = 11.sp,
                    fontFamily = RubikFont,
                    color = Color(0xFF8E899B)
                )
            }
        }

        when (docType) {
            "PRIVACY" -> {
                LegalSection(
                    "1. What We Collect",
                    "We collect only what is needed to run the service: your phone number " +
                        "(for login verification), a display name and avatar ID (your choices), " +
                        "your wallet and transaction records, and a Firebase push-notification " +
                        "token (to deliver deposit/withdrawal updates). We do not collect your " +
                        "location, contacts, or advertising identifiers."
                )
                LegalSection(
                    "2. Third Parties We Share Data With",
                    "Data is shared only with service providers essential to operation: " +
                        "Firebase Cloud Messaging (Google) for push notifications, and a " +
                        "WhatsApp verification provider for login OTP. We do not sell or rent " +
                        "your personal data to anyone."
                )
                LegalSection(
                    "3. Cookies & Local Storage",
                    "The app does not use tracking cookies. During a payment session, a " +
                        "temporary session token and order expiry timestamp are stored in your " +
                        "browser's local storage purely to keep your payment session alive, and " +
                        "are not used for advertising or profiling."
                )
                LegalSection(
                    "4. Your Rights (DPDP Act, 2023)",
                    "You may request access, correction, or erasure of your personal data, or " +
                        "withdraw consent, at any time: use Settings > Delete Account in the app, " +
                        "or write to the Grievance Officer below. Deletion requests are honoured " +
                        "within 30 days; financial transaction records are retained in anonymised " +
                        "form only as long as applicable financial regulations require."
                )
                LegalSection(
                    "5. Data Security",
                    "Personal data is transmitted over encrypted connections and access to " +
                        "production systems is restricted. No payment method credentials (UPI " +
                        "PINs, card numbers) are collected or stored by us."
                )
                LegalSection(
                    "6. Grievance Officer",
                    "As required under the Information Technology (Intermediary Guidelines and " +
                        "Digital Media Ethics Code) Rules, 2021 and DPDP Act, 2023:\n" +
                        "Name: Satyam Kumar\n" +
                        "Email: grievance@bitarcadegame.com\n" +
                        "Entity: Bit Arcade Interactive Gaming\n" +
                        "Grievances are acknowledged within 72 hours and resolved within 30 days."
                )
            }
            "REFUND" -> {
                LegalSection(
                    "1. Failed Deposits",
                    "If money is debited from your account but your wallet is not credited, " +
                        "report it from Help Centre with your 12-digit UTR number. Verified failed " +
                        "transactions are refunded to the original source account within 5-7 " +
                        "working days after manual verification."
                )
                LegalSection(
                    "2. Withdrawals",
                    "Withdrawal requests are reviewed and processed to your nominated UPI ID. " +
                        "Processing may take up to 24 hours depending on verification and bank " +
                        "timelines. Withdrawals cannot be cancelled once approved."
                )
                LegalSection(
                    "3. Completed Game Rounds",
                    "Once a game round is completed and the result is declared, the stake for " +
                        "that round is non-refundable, as the outcome is final."
                )
                LegalSection(
                    "4. Bonus & Promotional Credits",
                    "Promotional or bonus credits carry no cash redemption value and may be " +
                        "reversed if obtained through abuse of offers or system errors."
                )
                LegalSection(
                    "5. How to Request a Refund",
                    "Contact support@bitarcadegame.com or use Help Centre > Contact Support " +
                        "with your transaction ID. Refund grievances are resolved within 30 days " +
                        "in line with the Grievance Officer process in our Terms of Service."
                )
            }
            else -> {
                LegalSection(
                    "1. Eligibility",
                    "You must be at least 18 years old and reside in an Indian state where " +
                        "skill-based real-money gaming is permitted. Services are not offered in " +
                        "states that prohibit real-money gaming (currently including Telangana, " +
                        "Andhra Pradesh, Assam, Odisha, Sikkim and Nagaland). Accounts of minors " +
                        "or residents of restricted states will be terminated and deposits refunded."
                )
                LegalSection(
                    "2. Nature of Games",
                    "All games offered are games of skill under Indian law. Outcomes depend on " +
                        "player skill and decision-making. No guarantee of winning is made, and " +
                        "past performance does not indicate future results. Playing involves " +
                        "financial risk."
                )
                LegalSection(
                    "3. Wallet, Deposits & Withdrawals",
                    "Deposits are credited only after payment verification. Withdrawals are " +
                        "processed to the UPI ID you nominate and may require identity " +
                        "verification for larger amounts or suspected abuse. See our Refund & " +
                        "Cancellation Policy for failed-transaction handling."
                )
                LegalSection(
                    "4. Responsible Gaming",
                    "Play responsibly. You may request deposit limits or self-exclusion by " +
                        "contacting support. If gaming stops being fun, take a break. " +
                        "18+ only. This service is not for users in restricted states."
                )
                LegalSection(
                    "5. Acceptable Use",
                    "You may not use multiple accounts, bots, exploits, or collusion to gain " +
                        "unfair advantage. Accounts engaged in fraud, money laundering, or " +
                        "payment abuse may be suspended and balances forfeited, and may be " +
                        "reported to law enforcement."
                )
                LegalSection(
                    "6. Governing Law & Grievances",
                    "These terms are governed by the laws of India. Disputes are subject to " +
                        "the exclusive jurisdiction of courts in India. Grievance Redressal:\n" +
                        "Name: Satyam Kumar\n" +
                        "Email: grievance@bitarcadegame.com\n" +
                        "Response within 30 days as required by law."
                )
            }
        }

        Spacer(modifier = Modifier.height(30.dp))
    }
}

@Composable
private fun LegalSection(title: String, body: String) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(Color(0xFF0F1015))
            .border(1.dp, Color(0xFF1E2028), RoundedCornerShape(14.dp))
            .padding(16.dp)
    ) {
        Text(
            text = title,
            fontSize = 15.sp,
            fontFamily = RubikFont,
            fontWeight = FontWeight.Bold,
            color = Color.White
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = body,
            fontSize = 13.sp,
            fontFamily = RubikFont,
            color = Color(0xFF8E899B),
            lineHeight = 19.sp
        )
    }
}
