package com.FlowofEnglish.model;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "subscriptions")
public class ProgramSubscription {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long subscriptionId;

    @ManyToOne
    @JoinColumn(name = "program_id", nullable = false)
    private Program program;

    @ManyToOne
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;


    @Column(name = "start_date", nullable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
    @CreationTimestamp
    private OffsetDateTime startDate;

    @Column(name = "end_date", nullable = true)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
    private OffsetDateTime endDate;
    
   @Column(name = "transaction_id", nullable = false)
   private String transactionId;
   
   @Column(name = "transaction_type", nullable = false)
   private String transactionType;
   
   @Column(name = "transaction_date", nullable = true)
   @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
   private OffsetDateTime transactionDate;
   
   @Column(name = "amount_paid")
   private float amountPaid; 

    @Column(name = "max_cohorts", nullable = true)
    private Integer maxCohorts;
    
    @Column(name = "uuid", unique = true, nullable = false, updatable = false)
    private String uuid;
 

// Default constructor
	public ProgramSubscription() {
	}


	// Parameterized constructor
	   
	 public ProgramSubscription(Long subscriptionId, Program program, Organization organization,
				OffsetDateTime startDate, OffsetDateTime endDate, 
				String transactionId, String transactionType,
				OffsetDateTime transactionDate, float amountPaid, 
				Integer maxCohorts, String uuid) {
			super();
			this.subscriptionId = subscriptionId;
			this.program = program;
			this.organization = organization;
			this.startDate = startDate;
			this.endDate = endDate;
			this.transactionId = transactionId;
			this.transactionType = transactionType;
			this.transactionDate = transactionDate;
			this.amountPaid = amountPaid;
			this.maxCohorts = maxCohorts;
			this.uuid = uuid;
		}

	// Getters and Setters 

	public Long getSubscriptionId() {
		return subscriptionId;
	}


	public void setSubscriptionId(Long subscriptionId) {
		this.subscriptionId = subscriptionId;
	}


	public Program getProgram() {
		return program;
	}


	public void setProgram(Program program) {
		this.program = program;
	}


	public Organization getOrganization() {
		return organization;
	}


	public void setOrganization(Organization organization) {
		this.organization = organization;
	}


	public OffsetDateTime getStartDate() {
		return startDate;
	}


	public void setStartDate(OffsetDateTime startDate) {
		this.startDate = startDate;
	}


	public OffsetDateTime getEndDate() {
		return endDate;
	}


	public void setEndDate(OffsetDateTime endDate) {
		this.endDate = endDate;
	}


	public String getTransactionId() {
		return transactionId;
	}


	public void setTransactionId(String transactionId) {
		this.transactionId = transactionId;
	}


	public String getTransactionType() {
		return transactionType;
	}


	public void setTransactionType(String transactionType) {
		this.transactionType = transactionType;
	}


	public OffsetDateTime getTransactionDate() {
		return transactionDate;
	}


	public void setTransactionDate(OffsetDateTime transactionDate) {
		this.transactionDate = transactionDate;
	}
	public float getAmountPaid() {
		return amountPaid;
	}


	public void setAmountPaid(float amountPaid) {
		this.amountPaid = amountPaid;
	}


	public Integer getMaxCohorts() {
		return maxCohorts;
	}


	public void setMaxCohorts(Integer maxCohorts) {
		this.maxCohorts = maxCohorts;
	}


	public String getUuid() {
		return uuid;
	}


	public void setUuid(String uuid) {
		this.uuid = uuid;
	}

	@Override
	public String toString() {
		return "ProgramSubscription [subscriptionId=" + subscriptionId + ", program=" + program + ", organization="
				+ organization + ", startDate=" + startDate + ", endDate=" + endDate + ", transactionId="
				+ transactionId + ", transactionType=" + transactionType + ", transactionDate=" + transactionDate
				+ ", amountPaid=" + amountPaid + ", maxCohorts=" + maxCohorts + ", uuid=" + uuid + "]";
	}


	// Method to ensure UUID and generate userId before persisting
    @PrePersist
    private void ensureUuid() {
        if (this.uuid == null) {
            this.uuid = UUID.randomUUID().toString();
        }
    }
}
