import os
from werkzeug.utils import secure_filename
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User

kyc_bp = Blueprint('kyc', __name__)

UPLOAD_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), '../uploads/kyc'))

@kyc_bp.route('/status', methods=['GET'])
@jwt_required()
def get_kyc_status():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    return jsonify({
        "kyc_status": user.kyc_status or "Unverified",
        "license_number": user.license_number,
        "license_image_url": user.license_image_url,
        "kyc_rejected_reason": user.kyc_rejected_reason
    }), 200

@kyc_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_kyc():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    license_number = request.form.get('license_number')
    if not license_number:
        return jsonify({"error": "Driving License number is required"}), 400

    license_image_url = user.license_image_url
    if 'license_image' in request.files:
        file = request.files['license_image']
        if file and file.filename != '':
            filename = secure_filename(f"user_{user.id}_dl_{file.filename}")
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            license_image_url = f"/uploads/kyc/{filename}"

    user.license_number = license_number.strip().upper()
    user.license_image_url = license_image_url
    user.kyc_status = "Pending"
    user.kyc_rejected_reason = None
    db.session.commit()

    return jsonify({
        "message": "Driving license submitted successfully. Verification is pending approval.",
        "kyc_status": user.kyc_status,
        "license_number": user.license_number,
        "license_image_url": user.license_image_url
    }), 200

@kyc_bp.route('/admin/pending', methods=['GET'])
@jwt_required()
def get_pending_kyc():
    admin_id = get_jwt_identity()
    admin = User.query.get(admin_id)
    if not admin or not admin.is_admin:
        return jsonify({"error": "Unauthorized"}), 403

    pending_users = User.query.filter_by(kyc_status="Pending").all()
    results = []
    for u in pending_users:
        results.append({
            "user_id": u.id,
            "name": u.name,
            "email": u.email,
            "phone": u.phone,
            "license_number": u.license_number,
            "license_image_url": u.license_image_url,
            "kyc_status": u.kyc_status,
            "submitted_at": u.created_at.isoformat()
        })
    return jsonify(results), 200

@kyc_bp.route('/admin/review/<int:user_id>', methods=['POST'])
@jwt_required()
def review_kyc(user_id):
    admin_id = get_jwt_identity()
    admin = User.query.get(admin_id)
    if not admin or not admin.is_admin:
        return jsonify({"error": "Unauthorized"}), 403

    target_user = User.query.get(user_id)
    if not target_user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json() or {}
    decision = data.get('decision') # 'Approved' or 'Rejected'
    reason = data.get('reason', '')

    if decision not in ['Approved', 'Rejected']:
        return jsonify({"error": "Decision must be 'Approved' or 'Rejected'"}), 400

    if decision == 'Approved':
        target_user.kyc_status = "Verified"
        target_user.kyc_rejected_reason = None
    else:
        target_user.kyc_status = "Rejected"
        target_user.kyc_rejected_reason = reason or "Document unclear or invalid license format."

    db.session.commit()
    return jsonify({
        "message": f"KYC status updated to {target_user.kyc_status}",
        "user_id": target_user.id,
        "kyc_status": target_user.kyc_status
    }), 200
