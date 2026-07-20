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
  phoneCompact: { width: 360, height: 640, aspectRatio: 360 / 640 },
  phoneFullHdPortrait: { width: 405, height: 720, aspectRatio: 405 / 720 },
  phoneTall: { width: 390, height: 844, aspectRatio: 390 / 844 },
  phoneWide: { width: 568, height: 390, aspectRatio: 568 / 390 },
  tablet: { width: 700, height: 1024, aspectRatio: 700 / 1024 },
  tabletWide: { width: 1000, height: 900, aspectRatio: 1000 / 900 },
  desktop: { width: 1280, height: 800, aspectRatio: 1280 / 800 },
} as const;

describe("Board layout parity", () => {
  it("resolves viewport profiles deterministically", () => {
    expect(resolveBoardViewportProfile(viewports.phoneCompact)).toBe("phoneCompact");
    expect(resolveBoardViewportProfile(viewports.phoneFullHdPortrait)).toBe("phoneCompact");
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

  it("reserves extra vertical separation only for six-player side trick stacks", () => {
    const fourPlayer = buildBoardLayoutModel({
      surface: "match",
      totalSeats: 4,
      viewport: viewports.desktop,
    });
    const sixPlayer = buildBoardLayoutModel({
      surface: "match",
      totalSeats: 6,
      viewport: viewports.desktop,
    });

    expect(fourPlayer.centerStack.sideVerticalSpreadBoost).toBe(0);
    expect(sixPlayer.centerStack.sideVerticalSpreadBoost).toBe(7);
  });

  it.each([
    ["phone compact", viewports.phoneCompact, "-0.5rem", "0rem"],
    ["phone tall", viewports.phoneTall, "-0.5rem", "-0.65rem"],
    ["phone wide", viewports.phoneWide, "-0.55rem", "-0.45rem"],
    ["tablet", viewports.tablet, "-0.86rem", "0rem"],
    ["tablet wide", viewports.tabletWide, "-1rem", "0rem"],
    ["desktop", viewports.desktop, "-1rem", "0rem"],
  ] as const)(
    "keeps the match header and board vertically composed on %s screens",
    (_label, viewport, headerOffset, boardOffset) => {
      const layout = buildBoardLayoutModel({
        surface: "match",
        totalSeats: 6,
        viewport,
      });

      expect(layout.match?.topBarTranslateY).toBe(headerOffset);
      expect(layout.match?.boardTranslateY).toBe(boardOffset);
    },
  );

  it.each([
    ["phone compact", viewports.phoneCompact, "clamp(3.4rem, 10.7vw, 3.8rem)"],
    ["phone tall", viewports.phoneTall, "clamp(3.65rem, 10.7vw, 4.15rem)"],
    ["phone wide", viewports.phoneWide, "clamp(3.12rem, 4.35vw, 3.25rem)"],
    ["tablet", viewports.tablet, "clamp(3.25rem, 5.3vw, 3.8rem)"],
    ["tablet wide", viewports.tabletWide, "clamp(3.4rem, 3vw, 3.8rem)"],
    ["desktop", viewports.desktop, "clamp(3.55rem, 3.1vw, 3.95rem)"],
  ] as const)("uses a restrained played-card size on %s screens", (_label, viewport, width) => {
    const layout = buildBoardLayoutModel({
      surface: "match",
      totalSeats: 6,
      viewport,
    });

    expect(layout.match?.dock.playedCardWidth).toBe(width);
  });

  it("uses the phone-tall viewport more fully without scaling the dock", () => {
    const layout = buildBoardLayoutModel({
      surface: "match",
      totalSeats: 6,
      viewport: viewports.phoneTall,
    });

    expect(layout.frame.boardWidth).toBe("min(calc(100% - 0.45rem), 56rem)");
    expect(layout.frame.boardMaxHeight).toBe("54vh");
    expect(layout.match?.seatPresentation.avatarFrameSizePx).toBe(58);
    expect(layout.match?.seatPresentation.hiddenHandCardWidth).toBe(
      "clamp(1.9rem, 5.35vw, 2.1rem)",
    );
    expect(layout.match?.seatPresentation.tablePoints?.imageHeightMobile).toBe("1.16rem");
    expect(layout.match?.dock.handCardWidth).toBe("clamp(4.7rem, 14.2dvh, 6.65rem)");
  });

  it.each([
    ["compact", viewports.phoneCompact],
    ["tall", viewports.phoneTall],
  ] as const)("anchors played cards slightly below center on %s portrait phones", (_label, viewport) => {
    const layout = buildBoardLayoutModel({
      surface: "match",
      totalSeats: 6,
      viewport,
    });

    expect(layout.centerStack.centerShiftYPercent).toBe(4);
  });

  it("keeps compact portrait cards and announcements restrained", () => {
    const layout = buildBoardLayoutModel({
      surface: "match",
      totalSeats: 2,
      viewport: viewports.phoneCompact,
    });

    expect(layout.match?.dock.handCardWidth).toBe("clamp(4.1rem, 11.6dvh, 5.1rem)");
    expect(layout.match?.dock.playedCardWidth).toBe("clamp(3.4rem, 10.7vw, 3.8rem)");
    expect(layout.match?.dock.announcementTextSizes).toEqual({
      tertiary: "0.76rem",
      secondary: "0.84rem",
      primary: "1.12rem",
    });
    expect(layout.frame.boardHeight).toBe("auto");
    expect(layout.frame.boardMaxHeight).toBe("62vh");
    expect(layout.frame.boardAspectRatio).toBe("1 / 1.14");
    expect(layout.seatConfig.outwardOffsetY).toBe(3);
    expect(layout.seatConfig.topGroupShiftYPx).toBe(0);
    expect(layout.seatConfig.bottomGroupShiftYPx).toBe(8);
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
