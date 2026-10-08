package com.mthree.FraudAndTransactionRiskManager.service.appServices;

import com.mthree.FraudAndTransactionRiskManager.dao.CaseDao;
import com.mthree.FraudAndTransactionRiskManager.dto.Case;
import com.mthree.FraudAndTransactionRiskManager.dto.CaseStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import java.time.LocalDateTime;

@Service
public class CaseServiceImpl implements CaseService {

    @Autowired
    CaseDao caseDao;

    @Autowired
    TransactionService transactionService;

    @Override
    public Case getCase(int caseID) {
        return caseDao.findCaseById(caseID);
    }

    @Override
    public Case setCaseScore(int caseID, int score) {
        if (caseDao.findCaseById(caseID) == null) {
            return null;
        }
        caseDao.updateCaseScore(caseID, score);
        return caseDao.findCaseById(caseID);
    }

    @Override
    public Case addCaseForAccount(String accountID) {



        Case newCase = new Case();
        newCase.setAccountId(accountID);
        newCase.setStatus(Case.OPEN);
        newCase.setScore(0);
        newCase.setDescription("");
        LocalDateTime currentTime = LocalDateTime.now();
        newCase.setOpenedAt(currentTime);

        return caseDao.createCase(newCase);
    }

    @Override
    public List<Case> getCasesForAccount(String accountID) {
        return caseDao.findOpenCaseByAccountId(accountID);
        //throw new UnsupportedOperationException();
    }

    @Override
    @Transactional
    public Case createCase(Case newCase) {
        return caseDao.createCase(newCase);
    }

    @Override
    public List<Case> getCases() {
        return caseDao.findAllCases();
    }

    @Override
    public Case updateCase(Case updatedCase) {
        if (caseDao.findCaseById(updatedCase.getCaseId()) == null) {
            return null;
        }
        caseDao.updateCase(updatedCase);
        return caseDao.findCaseById(updatedCase.getCaseId());
    }

    @Override
    @Transactional
    public void deleteCase(int caseID) {
        caseDao.deleteTransactionsFromCase(caseID);
        caseDao.deleteCase(caseID);
    }

    @Override
    public Case addTransactionToCase(int caseID, String transactionID) {
        caseDao.addTransactionToCase(caseID,transactionID);
        return getCase(caseID);
    }

    @Override
    public Case setCaseDescription(int caseID, String description) {
        Case aCase = caseDao.findCaseById(caseID);
        if (aCase == null) {
            return null;
        }
        aCase.setDescription(description);
        caseDao.updateCase(aCase);
        return aCase;
    }

    @Override
    public Case setCaseStatus(int caseID, String status) {


        Case aCase = caseDao.findCaseById(caseID);
        if (aCase == null) {
            return null;
        }


        // do not update if case is closed
        CaseStatus currentStatus = CaseStatus.getStatusFromString(aCase.getStatus());



        switch (currentStatus) {
            // do not update case if currently closed
            case CLOSED_FRAUD:
                aCase.setStatus("Status not changed: case is closed and marked as fraud");

                return aCase;
            case CLOSED_SAFE:
                aCase.setStatus("Status not changed: case is closed and marked as safe");

                return aCase;
        }

        CaseStatus newStatus = CaseStatus.getStatusFromString(status);

        switch (newStatus) {
            case OPEN,UNDER_INVESTIGATION,ESCALATED:
                // update case
                aCase.setStatus(status);
                caseDao.updateCase(aCase);
                return aCase;
            case CLOSED_FRAUD,CLOSED_SAFE:
                // close case and update
                aCase.setStatus(status);
                LocalDateTime currentTime = LocalDateTime.now();
                aCase.setClosedAt(currentTime);
                caseDao.updateCase(aCase);
                return aCase;
            default:
                // do not update dao if invalid
                aCase.setStatus("invalid status");
                return aCase;
        }
    }


  @Override
    public Case setCaseDecision(int caseID, String decision, String decisionNote) {

        Case aCase = caseDao.findCaseById(caseID);

        if (aCase == null) {
            return null;
        }

        aCase.setDecision(decision);
        aCase.setDecisionNote(decisionNote);

        caseDao.updateCase(aCase);

        return caseDao.findCaseById(caseID);
    }
}
