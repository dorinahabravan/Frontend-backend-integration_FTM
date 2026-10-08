package com.mthree.FraudAndTransactionRiskManager.dao.Mappers;

import com.mthree.FraudAndTransactionRiskManager.dto.Case;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class CaseMapper implements RowMapper<Case> {

    @Override
    public Case mapRow(ResultSet rs, int rowNum) throws SQLException {
        Case temp = new Case();
        temp.setCaseId(rs.getInt("id"));
        temp.setAccountId(rs.getString("account_id"));
        temp.setStatus(rs.getString("status"));
        temp.setScore(rs.getInt("score"));
        temp.setDescription(rs.getString("description"));
        // Loads the investigator's saved decision and supporting note.
        temp.setDecision(rs.getString("decision"));
        temp.setDecisionNote(rs.getString("decision_note"));

        temp.setOpenedAt(rs.getString(("open_date")));
        temp.setClosedAt(rs.getString("close_date"));

        return temp;
    }
}
