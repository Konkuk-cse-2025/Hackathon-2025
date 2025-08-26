module.exports = (req, res, next) => {
	// 요청 파라미터에서 id를 가져옵니다.
	const { id } = req.params;

	// id가 숫자인지 확인합니다.
	if (!id || isNaN(Number(id))) {
		return res.status(400).json({ error: 'Invalid ID format' });
	}

	// 검증 통과 시 다음 미들웨어로 이동합니다.
	next();
};
