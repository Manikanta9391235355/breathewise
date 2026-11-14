from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class AskRequest(BaseModel):
    merchant_id: str = "M01"
    locale: str = "te-IN"
    question: Optional[str] = None
    from_date: Optional[str] = Field(None, alias="from")
    to_date: Optional[str] = Field(None, alias="to")
    audio_base64: Optional[str] = None

class ActionPreviewRequest(BaseModel):
    merchant_id: str = "M01"
    action_type: str = "winback_offer"
    offer_inr: int = 20

class ActionApproveRequest(BaseModel):
    merchant_id: str = "M01"

class DemoEventRequest(BaseModel):
    sale_id: str
    merchant_id: str
    sold_at: str
    amount_paise: int
    channel: str = "upi"
    status: str = "paid"
    source: str = "simulated_live"

class ImportPreviewRequest(BaseModel):
    merchant_id: str = "M01"
    column_mapping: Optional[Dict[str, str]] = None

class ImportCommitRequest(BaseModel):
    merchant_id: str = "M01"
    rows: List[Dict[str, Any]]

class VoiceTTSRequest(BaseModel):
    text: str
    locale: str = "te-IN"

class VoiceSTTRequest(BaseModel):
    audio_base64: str
    locale: str = "te-IN"
    mime_type: str = "audio/wav"
