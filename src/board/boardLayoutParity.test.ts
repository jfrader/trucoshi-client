import {
  buildBoardLayoutModel,
  buildOpponentHiddenHandLayout,
  buildSeatGeometry,
  buildSeatGeometries,
  getMatchSeatPresentationForIndex,
  resolveBoardViewportProfile,
} from "./index";

const EPSILON = 0.000001;

const viewports = {
  phoneTall: { width: 390, height: 844, aspectRatio: 390 / 844 },
  phoneWide: { width: 568, height: 390, aspectRatio: 568 / 390 },
  tablet: { width: 700, height: 1024, aspectRatio: 700 / 1024 },
  tabletWide: { width: 1000, height: 900, aspectRatio: 1000 / 900 },
  desktop: { width: 1280, height: 800, aspectRatio: 1280 / 800 },
} as const;

describe("Board layout parity", () => {
  it("resolves viewport profiles deterministically", () => {
    expect(resolveBoardViewportProfile(viewports.phoneTall)).toBe("phoneTall");
    expect(resolveBoardViewportProfile(viewports.phoneWide)).toBe("phoneWide");
    expect(resolveBoardViewportProfile(viewports.tablet)).toBe("tablet");
    expect(resolveBoardViewportProfile(viewports.tabletWide)).toBe("tabletWide");
    expect(resolveBoardViewportProfile(viewports.desktop)).toBe("desktop");
  });

  it("keeps seat geometry trigonometric invariants", () => {
    const geometries = buildSeatGeometries({
      totalSeats: 6,
      config: {
        radiusXMultiplier: 1.04,
        radiusYMultiplier: 1.08,
        sideWeightedYMultiplier: true,
        outwardOffsetX: 3,
        outwardOffsetY: 5,
        sideInset: 2,
        sideVerticalOffset: 1,
        angleOffsetDeg: -15,
        sideAngleOffsetDeg: -10,
        topGroupShiftYPx: 12,
        bottomGroupShiftYPx: 14,
      },
    });

    expect(geometries).toHaveLength(6);
    geometries.forEach((geometry) => {
      expect(Number.isFinite(geometry.leftPercent)).toBe(true);
      expect(Number.isFinite(geometry.topPercent)).toBe(true);
      expect(Math.abs(geometry.cos ** 2 + geometry.sin ** 2 - 1)).toBeLessThan(0.0001);
      expect(geometry.angleRad).toBeCloseTo((geometry.angleDeg * Math.PI) / 180, 6);
      expect(geometry.sideStrength).toBeCloseTo(Math.abs(geometry.cos), 6);
    });
  });

  it("keeps match and lobby seat override behavior intact", () => {
    const matchTwo = buildBoardLayoutModel({
      surface: "match",
      totalSeats: 2,
      viewport: viewports.phoneTall,
    });
    expect(matchTwo.seatConfig.angleOffsetDeg).toBe(-14);
    expect(matchTwo.seatConfig.sideAngleOffsetDeg).toBe(-14);

    const matchFour = buildBoardLayoutModel({
      surface: "match",
      totalSeats: 4,
      viewport: viewports.phoneTall,
    });
    expect(matchFour.seatConfig.angleOffsetDeg).toBe(-16);
    expect(matchFour.seatConfig.sideAngleOffsetDeg).toBe(-22);

    const lobbyFourDesktop = buildBoardLayoutModel({
      surface: "lobby",
      totalSeats: 4,
      viewport: viewports.desktop,
    });
    expect(lobbyFourDesktop.seatConfig.angleOffsetDeg).toBe(0);
    expect(lobbyFourDesktop.seatConfig.sideAngleOffsetDeg).toBe(0);
    expect(lobbyFourDesktop.seatConfig.outwardOffsetX).toBe(0);
    expect(lobbyFourDesktop.match).toBeNull();
    expect(lobbyFourDesktop.lobby).not.toBeNull();
  });

  it("keeps seat presentation rules for me/lower-side/default seats", () => {
    const layout = buildBoardLayoutModel({
      surface: "match",
      totalSeats: 6,
      viewport: viewports.phoneWide,
    });

    const meSeat = getMatchSeatPresentationForIndex({
      layout,
      seatIndex: 0,
      isMe: true,
    });
    const lowerSide = getMatchSeatPresentationForIndex({
      layout,
      seatIndex: 1,
      isMe: false,
    });
    const neutralSeat = getMatchSeatPresentationForIndex({
      layout,
      seatIndex: 2,
      isMe: false,
    });

    expect(meSeat.translateY).toBe(layout.match?.seatPresentation.meTranslateY);
    expect(lowerSide.translateY).toBe(layout.match?.seatPresentation.lowerSideTranslateY);
    expect(neutralSeat.translateY).toBe(0);
  });

  it("keeps hidden-hand card count and symmetry invariants", () => {
    const geometry = buildSeatGeometry({
      index: 0,
      totalSeats: 6,
      config: {
        radiusXMultiplier: 1,
        radiusYMultiplier: 1,
        sideWeightedYMultiplier: false,
        outwardOffsetX: 0,
        outwardOffsetY: 0,
        sideInset: 0,
        sideVerticalOffset: 0,
        angleOffsetDeg: 0,
        sideAngleOffsetDeg: 0,
        topGroupShiftYPx: 0,
        bottomGroupShiftYPx: 0,
      },
    });

    const rules = {
      tableInsetPx: 62,
      axialInsetReductionPx: 22,
      distanceScale: 0.82,
      verticalLiftPx: 1.5,
      fanSpacingPx: 11,
      fanArcDepthPx: 1.9,
      fanSpreadDeg: 6.3,
      minClearancePx: 9,
      handOrigin: "50% 114%",
    };

    const layouts = [0, 1, 2, 3].map((count) =>
      buildOpponentHiddenHandLayout({
        geometry,
        profileRules: rules,
        hiddenCardCount: count,
        avatarSizePx: 56,
        nameBlockPx: 30,
      }),
    );

    expect(layouts[0].cards).toHaveLength(0);
    expect(layouts[1].cards).toHaveLength(1);
    expect(layouts[2].cards).toHaveLength(2);
    expect(layouts[3].cards).toHaveLength(3);
    expect(layouts[2].cards[0].x).toBeCloseTo(-layouts[2].cards[1].x, 6);
    expect(Math.abs(layouts[2].cards[0].y - layouts[2].cards[1].y)).toBeLessThan(EPSILON);
    layouts.forEach((layoutResult) => {
      expect(Number.isFinite(layoutResult.anchor.x)).toBe(true);
      expect(Number.isFinite(layoutResult.anchor.y)).toBe(true);
      expect(Number.isFinite(layoutResult.anchor.rotateDeg)).toBe(true);
    });
  });
});
